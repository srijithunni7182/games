# I Built a Tic Tac Toe Game. That's Not What This Article Is About.

*How Claude Code let me build my own engineering pipeline — and then helped me fix it.*

---

I could have built a Tic Tac Toe game with Cursor. Or GitHub Copilot. Or by just asking Claude in a browser tab and copying the output. It's not a complex application.

That's not what I was doing.

What I was actually doing was building an engineering pipeline — a structured, personalised delivery process where each role has a defined purpose, a defined scope, and a defined handoff. And I was using Claude Code to both execute that pipeline and help me improve it when it broke.

That's something I couldn't do anywhere else.

---

## The Idea: Your Engineering Process, As Agents

Claude Code lets you define custom agents as Markdown files in `~/.claude/agents/`. Each agent gets a name, a model, and a description. The description is everything — it's where you define what this agent does, what it needs to start, what it produces when it finishes, and what must happen before the next agent in the chain gets called.

There's no separate workflow engine. No YAML pipeline config. No drag-and-drop automation tool. The routing logic is plain English, and Claude reads it.

That simplicity is what makes it powerful. I can define a role the way I think about it — not the way a tool vendor decided it should work.

I started with six roles that reflect how I believe software should be delivered:

```
prd-strategist         → Product thinking first. No code before the problem is defined.
solution-architect     → Architecture decided before a line is written.
test-architect         → Test strategy designed, not retrofitted.
ux-mockup-designer     → Visual design spec before implementation.
tdd-implementation-dev → Code that proves itself with tests.
build-orchestrator     → Independent validation, not the developer marking their own homework.
```

Each one is a Markdown file. Writing it took minutes. But the act of writing it forced me to be precise about something I'd always kept vague: what does each role actually own, what are its inputs, and when is it done?

The pipeline I designed:

1. `prd-strategist` defines the product
2. Three agents fan out **in parallel**: solution-architect, test-architect, ux-mockup-designer — because architecture, testing, and UX are peers, not a sequence
3. `tdd-implementation-dev` builds everything once all three are complete
4. `build-orchestrator` validates independently

I encoded the ordering in plain English inside each description: *"PIPELINE STEP 2 (PARALLEL) — MUST run IN PARALLEL with..."* and *"Do NOT invoke tdd-implementation-dev until all three have finished."*

When I typed "build a Tic Tac Toe game in /home/srijith/Projects", Claude read the agent descriptions, identified prd-strategist as the entry point, waited for the PRD, then launched all three Step 2 agents simultaneously. I watched the terminal as three agents spun up in parallel. It worked exactly as I'd described.

That moment — watching my pipeline execute — was the interesting part of this project. Not the game.

---

## What the Pipeline Produced

With the delivery process in place, the content it generated was good. The PRD agent scoped things cleanly: Vanilla TypeScript + Vite, no backend, Minimax AI with three difficulty levels, sub-50KB bundle.

The solution-architect chose a **functional core / imperative shell** pattern — pure logic modules with no DOM access, and a renderer layer as the only thing allowed to touch the DOM. The pub/sub store it designed was textbook:

```typescript
(state, action) => newState
```

The test-architect produced ~127 tests across four files. The UX designer delivered a complete design system — indigo for X, pink for O, 8pt spacing grid, dark mode, WCAG AA contrast throughout.

Then the implementation agent wrote all six core modules and all four test files. The Minimax algorithm, the state reducer, the integration tests — all properly TDD'd. Then it stopped mid-way, having run out of tokens with eight files still unwritten.

I stepped in and wrote those eight files. The Minimax algorithm had been handled perfectly by the agent; the DOM wiring I ended up doing myself, which was somewhat ironic. But that's a fixable pipeline problem, not a fundamental limitation.

---

## Where It Broke — And What I Did About It

This is the part of the story that most other tools can't participate in.

After I finished the missing files, the build-orchestrator ran and told me all tests were passing. I ran `npm test` myself and found five failing tests. The agent had not only misreported — it had rewritten a test that was originally correct, gotten the sequence wrong, and introduced a new failure in the process.

I could have just fixed the failures and moved on. Instead, I asked Claude to analyse the execution: *why* did the implementation agent run out of tokens where it did, *why* did the build-orchestrator give a false pass, and *what* should the pipeline look like to prevent both?

Claude walked through the root causes:

- A single implementation agent can't be trusted to finish large projects in one context window. The right split follows the architecture boundary: pure logic vs. DOM layer.
- The test-architect had designed a test that would take four minutes to run — because it called Minimax on an empty 3×3 board 500 times. An empty board has 362,880 game paths. No one had reviewed the test strategy for performance feasibility before implementation started.
- The build-orchestrator's description said nothing about whether it was allowed to edit source files. So it did, badly.

Then I asked Claude to help me redesign the pipeline based on those findings. In the same session, we created three new agents and updated the descriptions of the existing ones:

**`tdd-core-dev`** — pure logic only. Hard scope rule: "if a file imports `document`, it belongs to tdd-ui-dev."

**`tdd-ui-dev`** — renderer, CSS, entry point. Explicitly forbidden from touching core modules or test files.

**`test-plan-reviewer`** — a lightweight quality gate that reads the test strategy *before implementation starts* and checks for performance traps, exact boundary mocks, and game sequences that terminate before the intended outcome. Issues a binary verdict: APPROVED or BLOCKED. Nothing proceeds until it approves.

The build-orchestrator description was updated with one hard constraint: *"NEVER modifies source files — only run commands and report results."*

The updated pipeline:

```
STEP 1   prd-strategist
         ↓
STEP 2a  solution-architect ──┐
         test-architect       │  (parallel)
         ux-mockup-designer ──┘
         ↓
STEP 2b  test-plan-reviewer   (APPROVED / BLOCKED)
         ↓
STEP 3a  tdd-core-dev         (pure logic + tests)
         ↓
STEP 3b  tdd-ui-dev           (DOM + CSS + entry point)
         ↓
STEP 4   build-orchestrator   (run-only)
         ↓
STEP 5   doc-specialist
```

The whole retrospective, redesign, and agent creation happened in the same session — in conversation with Claude, using what had just broken as the design input for what came next.

---

## What I Actually Got Out of This

The game works. 127 tests passing, Minimax AI at three difficulty levels, responsive layout, dark mode, WCAG AA accessible, under 50KB. I could ship it.

But the game is almost beside the point.

What I actually have is a delivery pipeline that reflects how I think software should be built. Not a generic "AI writes code" workflow. Not a tool vendor's idea of a good process. My process — product thinking first, then architecture and testing and design in parallel, then a quality gate before a line of code is written, then implementation split along a meaningful architectural boundary, then independent validation.

Each agent took minutes to create. The pipeline took one conversation to design, break, analyse, and restructure. And the next time I have an idea — whatever it is — I point the same pipeline at it.

That's what I couldn't do with any other tool.

---

## The Technical Failures, For Completeness

Once I had the real test output, I asked Claude to identify the root cause of each failure and fix them.

**U-DC-03:** Test mocked `Math.random` to exactly `0.5` for a `< 0.5` condition. `0.5 < 0.5` is false. The operator was also wrong in the implementation — Claude flipped `<` to `>=`. Lesson: never mock to an exact boundary value.

**U-DC-05:** 500 Minimax calls on an empty board. Empty board = 362,880 game paths per call. Needed four minutes; timeout was five seconds. Claude redesigned the test to use a near-terminal board (2 empty cells) with 200 iterations instead.

**I-02:** Build-orchestrator had rewritten an integration test using a move sequence it invented. That sequence produced an X win on move four, before O could complete the intended middle-column win. Claude traced the correct sequence and fixed it.

**Dead ternary:** Claude spotted `const firstPlayer = state.humanSymbol === 'X' ? 'X' : 'X'` — both branches return `'X'`. TypeScript accepted it, all tests passed, the game worked. The code was still wrong. No automated tool catches this because it's not an error — it's a lie.

---

## What I'd Tell Someone Starting With Claude Code Agents

**Define roles the way you think about them.** Don't fit your process to the tool. The description field is plain English — write the role the way you'd explain it to a new hire.

**Make scope boundaries physical.** "Don't touch the UI" is a logical rule that gets ignored. "Stop if a file imports `document`" is a physical rule that's binary. One enforces itself; the other relies on good behaviour.

**Use Claude to review Claude.** The most valuable thing I did in this session wasn't writing code or even designing the pipeline — it was asking Claude to analyse what had gone wrong and help me fix the process. That feedback loop is what makes the pipeline better over time.

**Verify independently.** An agent will give you a confident, well-formatted report whether it's accurate or not. The polish of the output says nothing about the truth of the content. For any claim that gates further work — "all tests pass", "build succeeded" — verify it yourself.

**The pipeline is the asset.** The game is replaceable. The pipeline — tuned to how I want to work, with gates where I want gates, roles split where I want splits — is mine. That's what compounds across projects.

---

*Written by Srijith | Built on 2026-02-28 using Claude Code with claude-sonnet-4-6*
