# Building Tic Tac Toe with Claude Code: A Story of Agents, Pipelines, and Expensive Mistakes

*How I used Claude Code's multi-agent system to build a real project from scratch — and what broke along the way.*

---

I wanted to build a simple web-based Tic Tac Toe game with AI. Nothing ambitious. But I decided to treat it as an experiment: could I use Claude Code's custom agent pipeline to take a vague idea all the way to a working, tested, documented application without writing code myself?

The short answer: yes, almost. The longer answer is far more interesting.

---

## Setting Up the Pipeline

Before giving Claude any instructions about the game itself, I spent time building the delivery pipeline. Claude Code lets you define custom agents as Markdown files in `~/.claude/agents/`. Each agent has a name, a model, and a `description` field that the orchestrating model reads when deciding which agent to call next.

That description field is your only routing mechanism. There's no explicit workflow engine or "then call X" wiring. You write the handoff logic in plain English inside the description, and Claude reads it and decides what to do. I found this both surprisingly powerful and surprisingly easy to get wrong.

I started with six agents:

```
prd-strategist         → Turns a rough idea into a PRD
solution-architect     → Designs the system architecture
test-architect         → Writes the test strategy
ux-mockup-designer     → Creates the visual design spec
tdd-implementation-dev → Writes all the code
build-orchestrator     → Compiles, tests, reports
```

The pipeline I wanted:

1. `prd-strategist` creates the PRD
2. Three agents fan out **in parallel**: solution-architect, test-architect, ux-mockup-designer
3. Once all three finish, `tdd-implementation-dev` implements everything
4. `build-orchestrator` validates the final build

I encoded this ordering entirely in the description fields — phrases like *"PIPELINE STEP 2 (PARALLEL) — MUST run IN PARALLEL with..."* and *"Do NOT invoke tdd-implementation-dev until all three have finished."*

When I gave Claude the prompt "build a Tic Tac Toe game in /home/srijith/Projects", it correctly identified the prd-strategist as the entry point, waited for the PRD, then launched all three Step 2 agents simultaneously in the background. I watched the terminal as three agents spun up and ran in parallel. That part worked exactly as designed.

---

## What Claude Built

The PRD agent came back with clean, sensible scope: Vanilla TypeScript + Vite, no backend, Minimax AI with Easy/Medium/Hard difficulty, sub-50KB bundle.

The solution-architect designed a **functional core / imperative shell** architecture — pure modules for game logic, AI, and state management with zero DOM access, and a separate renderer layer as the only thing allowed to touch the DOM. The pub/sub store pattern it chose was textbook clean:

```typescript
(state, action) => newState
```

The test-architect mapped out ~127 tests across four files. The UX designer produced a complete design system — indigo for X, pink for O, an 8pt spacing grid, dark mode, WCAG AA contrast throughout.

Then `tdd-implementation-dev` got to work. I watched it write all six core modules and all four test files. The types, the Minimax algorithm, the state reducer, the integration tests — all of it, properly TDD'd. I was genuinely impressed. Then it stopped.

---

## The Credit Exhaustion Problem

At 51 tool uses and 446 seconds into its run, the implementation agent ran out of tokens mid-task. It left the renderer, CSS, and entry point completely unwritten — eight files. The core was done; the shell was empty.

I had to step in and write those eight files myself:
- `src/renderer/dom-helpers.ts`
- `src/renderer/menu.ts`
- `src/renderer/setup.ts`
- `src/renderer/game.ts`
- `src/renderer/index.ts`
- `src/styles/main.css`
- `src/main.ts`
- `public/favicon.svg`

The irony: the hardest part — the Minimax algorithm — was handled perfectly by the agent. The DOM wiring I ended up doing myself.

The lesson I took from this: a single agent tasked with "implement everything" will always be limited by its context window. The right split isn't "planning vs. coding" — it's "pure logic vs. DOM layer." Those two halves have no shared context needs, making them a natural seam for separate agents.

---

## The False Positive That Nearly Fooled Me

With all files written, the `build-orchestrator` ran. It reported:

> ✅ All 108 tests passing. Build successful.

I almost moved on. Then I ran `npm test` myself and got the real picture: five tests were failing — U-DC-03, U-DC-05, I-02, I-03, and I-06.

The build-orchestrator had either read partial output or confused a previous run with the current one. But it had also made things actively worse: while trying to fix the failures, it had rewritten a test that was originally correct, got the move sequence wrong, and introduced a new failure that hadn't existed before.

This was the moment I understood a critical design flaw in how I'd set up the agent. I'd never told the build-orchestrator it wasn't allowed to edit source files. So it did. A build agent that edits source code to make tests pass isn't a build agent — it's a developer in disguise, one that doesn't know the domain well enough to make correct changes.

---

## Five Failures, Five Root Causes

Once I had the real test output, I worked through each failure:

**U-DC-03: Wrong probability branch**

The test mocked `Math.random()` to return exactly `0.5` and expected Minimax to be used. The code did:

```typescript
return Math.random() < MEDIUM_MINIMAX_PROBABILITY  // 0.5
  ? getBestMove(board, aiPlayer)
  : getRandomMove(board);
```

`0.5 < 0.5` is `false`. Random was used. Minimax was expected. Flipping `<` to `>=` fixed it and matched the semantic intent better anyway.

The deeper issue: mocking `Math.random` to exactly `0.5` for a `< 0.5` condition tests neither branch. Safe values are `0.3` (clearly inside) and `0.7` (clearly outside). Exact boundary mocks are a trap.

**U-DC-05: Minimax on an empty board, 500 times**

The test ran `getAIMove()` on an empty 3×3 board 500 times. An empty Tic Tac Toe board has **362,880 possible game paths**. Minimax explores all of them on every call. This test needed roughly four minutes to complete. The default timeout is five seconds.

The fix: use a near-terminal board with only 2 empty cells, reduce to 200 iterations. The statistical property being verified doesn't require 500 calls on a full board.

**I-02: A "draw" sequence that was actually a win**

The build-orchestrator had rewritten an integration test using a move sequence it invented. That sequence produced an X win on move four. The game ended before O had a chance to complete the intended middle-column win.

This is easy to get wrong — Tic Tac Toe ends the moment anyone wins, so a sequence you design as an O win can silently terminate earlier if you haven't traced through X's moves first. The correct sequence for O winning via indices 1, 4, 7:

```
X@0, O@1, X@3, O@4, X@5, O@7  →  O wins [1, 4, 7]
```

X's moves (0, 3, 5) must not form any winning line before O completes the column.

**I-03 and I-06:** I-03 cascaded from I-02 via shared setup state. I-06 was a legitimate 14-second AI simulation that needed an explicit timeout override — once the configuration was correct it passed fine.

---

## The Code That Lied to the Compiler

While working through those failures, I spotted this in `state.ts`:

```typescript
const firstPlayer = state.humanSymbol === 'X' ? 'X' : 'X';
```

Both branches return `'X'`. TypeScript accepted it without complaint. The tests all passed. The game played correctly. And the code was silently wrong — it was meant to respect the human's chosen symbol.

It turned out X always goes first in standard Tic Tac Toe regardless of which symbol you pick, so the behaviour was accidentally correct. But the dead ternary was a landmine for anyone reading the code expecting it to mean something. One line fix:

```typescript
const firstPlayer = 'X' as const;
```

The kind of bug no linter catches because it's not an error — it's a lie.

---

## What Needed to Change

After getting all 127 tests green and the build passing, I sat down to think about what I'd do differently.

**Problem 1: One implementation agent can't finish a large project.** It hit the token ceiling with eight files unwritten. The split should follow the architecture: pure logic (no DOM) vs. imperative shell (DOM/CSS/entry-point). Two focused agents, each handling half.

**Problem 2: Flawed test designs go unreviewed.** The test-architect wrote a test that would run for four minutes. Nobody checked the performance math before implementation started. A lightweight review step between "test strategy written" and "implementation starts" would catch this class of problem before it becomes a wasted build.

**Problem 3: The build agent must be read-only.** Its job is to run commands and report truth. If it can edit source files, it becomes an unreliable narrator that quietly corrupts the codebase while claiming success.

---

## The Improved Pipeline

Three problems, three structural changes:

**Split the implementation agent in two:**
- `tdd-core-dev` (Step 3a) — pure logic only. Scope rule: "if a file imports `document`, it belongs to tdd-ui-dev."
- `tdd-ui-dev` (Step 3b) — renderer, CSS, entry point. Explicitly forbidden from touching core modules or test files.

**Add `test-plan-reviewer` as a quality gate (Step 2b):**

A lightweight agent (Haiku model) that reads the test strategy before any implementation begins and checks for: expensive loops, exact boundary mocks, missing timeout declarations, tests that share mutable state, and game sequences that terminate before the intended outcome. Binary verdict: **APPROVED** or **BLOCKED**. Implementation can't start until it's approved.

**Constrain the build-orchestrator:**

Updated description: *"NEVER modifies source files — only run commands and report results. If tests fail, report the exact error and stop."*

The final pipeline:

```
STEP 1   prd-strategist
         ↓
STEP 2a  solution-architect ──┐
         test-architect       │ (parallel)
         ux-mockup-designer ──┘
         ↓
STEP 2b  test-plan-reviewer  (quality gate: APPROVED / BLOCKED)
         ↓
STEP 3a  tdd-core-dev        (pure logic + tests)
         ↓
STEP 3b  tdd-ui-dev          (DOM + CSS + entry point)
         ↓
STEP 4   build-orchestrator  (run-only, no source edits)
         ↓
STEP 5   doc-specialist
```

---

## What I Learned

**The description field is your pipeline.** There's no workflow engine. Claude reads each agent's description and routes accordingly. Write descriptions like contracts: what this agent needs, what it produces, what must be true before it starts.

**Make scope boundaries physical, not logical.** "Don't touch the UI" is a logical rule that gets ignored under pressure. "Stop if a file imports `document`" is physical and binary. Agents respect hard constraints better than soft ones.

**Quality gates pay for themselves.** Adding a test-plan-reviewer costs one extra agent call. In exchange it catches a whole class of problems — performance traps, boundary mock errors, broken game sequences — before a single line of implementation is written. The asymmetry is strongly in favour of the gate.

**Verify independently.** The build-orchestrator claimed 108/108 tests passing. It was wrong. Running `npm test` myself took ten seconds. Never trust a binary claim from an agent without checking it yourself, at least until the agent has proven it can be trusted.

**Agents are confidently wrong.** A well-formatted, structured report from an agent carries the same authority whether it's accurate or not. The polish of the output format has no bearing on the truth of the content. The more consequential the claim ("all tests pass", "build succeeded"), the more important it is to verify independently.

**The architecture was genuinely good.** The functional core / imperative shell pattern, the pub/sub store, event delegation on the board, the CSS gap trick for grid lines — I didn't nudge Claude toward any of these. It chose them on its own. Where things broke down wasn't domain knowledge, it was execution mechanics: token budgets, performance math, and an agent that could edit files it shouldn't have touched.

---

## Where It Ended Up

A fully working Tic Tac Toe game:
- 127 tests, all passing
- Minimax AI at Easy/Medium/Hard
- 2-player hotseat mode
- Responsive, dark mode, reduced-motion, WCAG AA accessible
- Production build under 50KB

Code I wrote myself: eight renderer/CSS/entry-point files and four targeted bug fixes. Everything else — six core modules, four test files, the full design system, all the documentation, and the agent infrastructure itself — Claude generated.

But the more useful output of this session wasn't the game. It was a pipeline I now understand well enough to fix when it breaks — and a clearer picture of where Claude Code agents are genuinely reliable and where they still need a human watching over their shoulder.

---

*Written by Srijith | Built on 2026-02-28 using Claude Code with claude-sonnet-4-6*
