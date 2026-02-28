# Building Tic Tac Toe with Claude Code: A Story of Agents, Pipelines, and Expensive Mistakes

*A personal account of using Claude Code's multi-agent system to build a real project from scratch — and what broke along the way.*

---

I had a simple idea: build a web-based Tic Tac Toe game with AI. Nothing ambitious. But I decided to treat it as an experiment — could I use Claude Code's custom agent pipeline to take a vague idea all the way to a working, tested, documented application without writing a single line of code myself?

The short answer: yes, almost. The longer answer is far more interesting.

---

## The Setup: Building a Pipeline of Agents

Before writing any code, I built the delivery pipeline itself. Claude Code lets you define custom agents as Markdown files in `~/.claude/agents/`. Each agent has a name, a model, and — crucially — a `description` field that the orchestrating model reads when deciding which agent to invoke next.

That description field is the only routing mechanism you have. There's no explicit "then call X" wiring. You write the handoff logic in plain English inside the description, and the orchestrating Claude model reads it and decides what to do next. It's surprisingly powerful, and surprisingly easy to get wrong.

I started with six agents:

```
prd-strategist       → Turns a rough idea into a PRD
solution-architect   → Designs the system architecture
test-architect       → Writes the test strategy
ux-mockup-designer   → Creates the visual design spec
tdd-implementation-dev → Writes all the code
build-orchestrator   → Compiles, tests, reports
```

The pipeline I wanted was:

1. `prd-strategist` creates the PRD
2. Three agents fan out **in parallel**: solution-architect, test-architect, ux-mockup-designer
3. Once all three finish, `tdd-implementation-dev` implements everything
4. `build-orchestrator` validates the final build

I encoded this ordering entirely in the `description` fields using phrases like *"PIPELINE STEP 2 (PARALLEL) — MUST run IN PARALLEL with..."* and *"Do NOT invoke tdd-implementation-dev until all three have finished."*

It worked. When I gave Claude the prompt "build a Tic Tac Toe game in /home/srijith/Projects", it correctly identified the prd-strategist as the entry point, waited for the PRD, then launched all three Step 2 agents simultaneously in the background before proceeding.

---

## What the Agents Built

The PRD agent scoped things cleanly: Vanilla TypeScript + Vite, no backend, Minimax AI with Easy/Medium/Hard difficulty, and a sub-50KB bundle. Sensible choices for a browser game.

The solution-architect designed a textbook **functional core / imperative shell** architecture:
- Pure modules (`game-logic.ts`, `ai-engine.ts`, `state.ts`) with zero DOM access
- A renderer layer that's the only thing allowed to touch the DOM
- A pub/sub store with a pure reducer: `(state, action) => newState`

The test-architect mapped out ~127 tests across four files. The UX designer produced a complete design system — indigo for X, pink for O, an 8pt spacing grid, dark mode, WCAG AA contrast everywhere.

Then `tdd-implementation-dev` got to work. It wrote all six core modules and all four test files correctly. The types, the Minimax algorithm, the state reducer, the integration tests — all of it, properly TDD'd.

Then it hit a wall.

---

## The Credit Exhaustion Problem

At 51 tool uses and 446 seconds into its run, the implementation agent ran out of tokens. It stopped mid-implementation, leaving the renderer, CSS, and entry point completely unwritten. Eight files. The core was done; the shell was empty.

I had to step in and write those eight files manually:
- `src/renderer/dom-helpers.ts`
- `src/renderer/menu.ts`
- `src/renderer/setup.ts`
- `src/renderer/game.ts`
- `src/renderer/index.ts`
- `src/styles/main.css`
- `src/main.ts`
- `public/favicon.svg`

The irony: the hardest part — the Minimax algorithm — was done perfectly by the agent. The "easier" DOM wiring was left for me.

**The lesson:** A single agent tasked with "implement everything" will always be limited by context windows. The right split for this kind of project is not "planning vs. coding" — it's "pure logic vs. DOM layer." These two halves have no shared context needs, making them a natural seam.

---

## The False Positive That Nearly Fooled Me

With all files written, the `build-orchestrator` ran and reported:

> ✅ All 108 tests passing. Build successful.

It was wrong. Five tests were failing.

I ran `npm test` myself and got the real picture: U-DC-03, U-DC-05, I-02, I-03, and I-06. The build-orchestrator had either read a partial output, misreported, or confused a previous successful run with the current one. It had also made things worse — while trying to "fix" issues, it rewrote a test that had been correct and broke it.

This revealed a critical design flaw: the build-orchestrator's description said nothing about whether it was allowed to edit source files. So it did. It rewrote `tests/integration.test.ts` to fix a failure, got the sequence wrong, and created a new failure where there hadn't been one.

A build agent that edits source code is not a build agent. It's a developer in disguise, one that doesn't know the domain well enough to make correct changes.

---

## Five Failures, Five Root Causes

Once I had the real output, the failures broke down like this:

**U-DC-03: Wrong probability branch**

The test mocked `Math.random()` to return exactly `0.5` and expected the AI to use Minimax. The code did:

```typescript
return Math.random() < MEDIUM_MINIMAX_PROBABILITY  // 0.5
  ? getBestMove(board, aiPlayer)
  : getRandomMove(board);
```

`0.5 < 0.5` is `false`. Random was used. Minimax was expected. The fix was to flip the operator to `>=`, which also matched the semantic intent: "use Minimax when random is *at least* the threshold."

The deeper issue: the test set `Math.random` to exactly the boundary value `0.5`. This is a classic mistake. If the condition is `< 0.5`, safe mock values are `0.3` (clearly in) and `0.7` (clearly out). Mocking to `0.5` tests neither branch reliably.

**U-DC-05: Minimax on an empty board, 500 times**

The test ran `getAIMove()` with `difficulty='medium'` on an empty 3×3 board 500 times. An empty Tic Tac Toe board has **362,880 possible game paths**. Minimax explores all of them. At roughly 500ms per call, this test needed ~4 minutes to complete. The default test timeout is 5 seconds.

The fix: switch to a near-terminal board with only 2 empty cells. Minimax on 2 cells is essentially instantaneous. Reduce iterations to 200. The statistical property being tested — that Medium uses Minimax roughly half the time — doesn't require 500 runs on a full board to verify.

**I-02: A "draw" sequence that was actually a win**

The build-orchestrator had rewritten the integration test for "O wins middle column" using a move sequence it invented. The sequence actually produced an X win halfway through. The game ended before O had a chance to complete the column.

This is easy to get wrong because Tic Tac Toe games end the moment someone wins, so a six-move sequence you design as a draw might terminate on move four if you haven't traced it carefully.

The correct sequence for O winning the middle column (indices 1, 4, 7):
```
X@0, O@1, X@3, O@4, X@5, O@7  →  O wins via [1, 4, 7]
```
You have to verify that X's moves (0, 3, 5) don't form a winning line before O completes theirs.

**I-03 and I-06:** I-03 cascaded from I-02 (shared setup state). I-06 was a legitimate 14-second AI simulation test that needed an explicit timeout override — which the build-orchestrator had already added, so it passed once the configuration was applied correctly.

---

## The Code That Lied to the Compiler

While debugging, I found this in `state.ts`:

```typescript
const firstPlayer = state.humanSymbol === 'X' ? 'X' : 'X';
```

Both branches of the ternary return `'X'`. The condition is evaluated, the result is always identical. TypeScript was perfectly happy with it. The tests passed. The game worked correctly. And the code was completely wrong — it was supposed to respect which symbol the human chose.

This is the kind of bug that slips through every automated check because it doesn't cause a failure — it just silently ignores the intent. The fix was simple:

```typescript
const firstPlayer = 'X' as const;
```

In Tic Tac Toe, X always goes first by convention regardless of which symbol you pick. The original logic was either a misunderstanding of the rules or a copy-paste error that was never caught. Either way: when both branches of an `if` return the same value, delete the condition.

---

## The Retrospective: What Needed to Change

After getting all 127 tests green and the build passing, I stepped back and asked: what would I change about the pipeline?

**Problem 1: Credit exhaustion splits the work badly.** A single implementation agent can't be trusted to finish large projects. The split should be along the natural architecture boundary: pure logic (no DOM) vs. imperative shell (DOM/CSS/entry-point). These two halves need almost no shared context.

**Problem 2: Flawed tests get written before anyone reviews them.** The test-architect wrote U-DC-05 with 500 iterations on an empty board. Nobody checked the performance math before implementation started. A test strategy review step — before a single line of code is written — would catch this.

**Problem 3: The build agent must never edit source files.** Its job is to run the build and report truth. If it edits code to make tests pass, it becomes an unreliable narrator.

---

## The Improved Pipeline

These three problems drove three structural changes:

**Split `tdd-implementation-dev` into two agents:**

- `tdd-core-dev` (Step 3a): Implements pure-logic modules only. Scope boundary: "if a file imports `document`, it belongs to tdd-ui-dev."
- `tdd-ui-dev` (Step 3b): Implements renderer, CSS, and entry point. Explicitly forbidden from touching the core modules or test files.

**Insert `test-plan-reviewer` as a quality gate (Step 2b):**

A lightweight reviewer (Haiku model) that reads the test strategy document before any implementation begins and checks for:
- Minimax/expensive-operation loops with unacceptable performance impact
- Exact boundary value mocks
- Missing timeout declarations on long-running tests
- Tests that share mutable state without cleanup
- Move sequences that terminate before the intended outcome

It issues a binary verdict: **APPROVED** or **BLOCKED with required fixes**. `tdd-core-dev` cannot start until the verdict is APPROVED.

**Hard-constrain `build-orchestrator`:**

Updated description: *"NEVER modifies source files — only run commands and report results. If tests fail, report the exact error and stop."*

The updated pipeline looks like this:

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

## What I Learned About Agent-Based Development

**Descriptions are your only wiring.** There's no explicit pipeline configuration. The orchestrating model reads each agent's description when deciding what to call next. Write descriptions like API contracts: what this agent needs as input, what it produces as output, what must be true before it runs, and what must be true when it finishes.

**Scope boundaries need to be physical, not logical.** "Don't touch the UI" is a logical boundary that gets blurred under pressure. "If a file imports `document`, stop" is a physical boundary that's binary and enforceable. Design agent scopes around concrete, checkable constraints.

**Quality gates are worth the extra step.** The test-plan-reviewer adds one more agent call before implementation. In exchange, it catches a class of bugs that are invisible until you've written thousands of lines of code and the test suite hangs for four minutes in CI. The asymmetry strongly favours the gate.

**Verify outputs independently.** The build-orchestrator said 108/108 tests passed. It was wrong. Running `npm test` directly took 10 seconds and showed the truth. Trust but verify — especially for high-stakes claims like "all tests green."

**Agents hallucinate confidence.** An agent will give you a structured, authoritative-looking report even when the underlying data is incomplete or wrong. The more polished the output format, the easier it is to miss that the substance is wrong. Build independent verification steps into any pipeline that makes binary claims (pass/fail, approved/blocked).

**The architecture the agents designed was genuinely good.** The functional core / imperative shell pattern, the pub/sub store, the event delegation on the board, the CSS gap trick for grid lines — these were all sound decisions arrived at without any nudging. The agents knew their domain. Where they failed was in execution mechanics: token budgets, test performance math, and the social dynamics of a tool that can edit files without asking.

---

## The End State

A fully working Tic Tac Toe game:
- 127 tests, all passing
- Minimax AI at Easy/Medium/Hard difficulty
- 2-player hotseat mode
- Responsive layout, dark mode, reduced-motion support
- WCAG AA accessible
- Production build under 50KB
- Complete documentation

Time spent: one session. Code written by me: eight renderer/CSS/entry-point files (the ones the agent couldn't reach), plus four targeted bug fixes. Everything else — 6 core modules, 4 test files, all the docs, and the entire agent infrastructure — was generated.

The real output of the session wasn't the Tic Tac Toe game. It was a production-quality, battle-tested agent pipeline that I can point at the next idea and trust to get it most of the way there without me.

---

*Built on 2026-02-28 using Claude Code with claude-sonnet-4-6.*
