# Project history and manual testing

This is the single living milestone and testing record. Add future version sections here; do not create per-release testing folders.

## MVP 0.1 — verified implementation (2026-10-11)

### Implemented scope

One analytical hollow circular cantilever seatpost lesson; SI calculation boundary; versioned material catalogue; interactive R3F rendering; labelled numeric/range controls; prediction/reveal learning activity; curated design FMEA; defensive local session persistence. The application is a local browser app, not a PWA. No CAD, real FEA solver, fatigue-life model, cloud service, or runtime LLM is included.

### Automated verification

Executed locally on Windows, Node.js 24.19.0 and pnpm 11.25.0:

| Command                                                                            | Observed result                                                                              |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                   | Passed; lockfile current                                                                     |
| `pnpm lint`                                                                        | Passed, zero lint errors                                                                     |
| `pnpm typecheck`                                                                   | Passed, TypeScript strict mode                                                               |
| `pnpm test:unit --reporter=json --outputFile=.omnilab/verification/full-unit.json` | 78/78 tests passed across 10 files                                                           |
| `pnpm build`                                                                       | Passed; static output in `dist`                                                              |
| `pnpm test:e2e`                                                                    | 9/9 passed in 36.5 seconds; three scenarios in each browser                                  |
| `pnpm exec node scripts/capture-screenshots.mjs`                                   | Passed; six captures, zero uncaught page errors or external requests                         |
| `pnpm dev`                                                                         | Started at 127.0.0.1:5179; HTTP 200 and correct application title; smoke-test server stopped |
| `pnpm preview`                                                                     | Started at 127.0.0.1:4179; production browser checks used this server                        |

The final `pnpm format:check` passed after formatting the consolidated documentation and source. The implementation commit is created only after `git diff --check` also passes. GitHub Actions is configured; no hosted CI execution is claimed.

Actual browser versions: Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2. Browser checks cover load/geometry/material changes, scale isolation, invalid-input recovery, keyboard tabs and reveal, persistence, blocked external HTTP/WebSockets, and 390-pixel page overflow. The capture inspection additionally checks both geometry benchmark trends, all three materials, zero load, native WebGL context loss/retry, and keyboard scrolling within the narrow FMEA table. Service workers are blocked during offline-isolation checks.

### Manual and visual checklist

The following records **Codex visual/source/math inspection and automated interaction**, not human-user testing.

| Check                                                          | Method and result                                                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Local start and default case                                   | Dev HTTP smoke check and production browser verification passed                                                    |
| 1440 × 900 composition, bore, clamp, force arrow, neutral axis | Codex inspected rendered screenshots; header/results spacing, arrow size, framing and sharp rim visibility refined |
| Signed legend and stress location                              | Visual/text inspection plus independent root/tip signed-stress geometry tests passed                               |
| Load, length, diameter, thickness and material trends          | Automated real-browser interaction and fixed calculation oracles passed                                            |
| Deformation multiplier and undeformed view                     | Unit/component and browser checks confirm unchanged real results                                                   |
| Zero load, invalid geometry and warnings                       | Engine/component tests and browser recovery checks passed                                                          |
| Predict, reveal and repeat                                     | Component/browser checks passed; prediction screenshot has neutral colours and hidden peak outputs                 |
| Keyboard operation and visible focus                           | Browser checks and Codex screenshot inspection passed; prediction feedback uses a persistent status region         |
| Five curated FMEA modes                                        | Codex inspected content and rendered table; seven fields and five rows verified automatically                      |
| Narrow layout and FMEA scrolling                               | 390 × 844 screenshots inspected; no page overflow; focusable table region responds to ArrowRight                   |
| Saved/corrupt/blocked session storage                          | Real-browser reload plus independent session/component tests passed                                                |
| External-service isolation and WebGL fallback                  | Zero external requests in intercepted production flows; native context loss and retry passed                       |
| Benchmark inputs, intermediates, units and signs               | Codex independently inspected N-mm hand reduction and 48-digit Decimal arithmetic; both benchmark cases passed     |
| Human-user / screen-reader / physical-device testing           | Not performed; remains follow-up work                                                                              |

Screenshots are in `artifacts/screenshots`: `desktop-explore.png`, `desktop-prediction.png`, `desktop-learn.png`, `desktop-fmea.png`, `mobile-explore.png`, and `mobile-fmea.png`. `inspection.json` records browser, viewport, build asset names and capture checks. Captures use the production build. Resetting scroll before full-page captures prevents off-screen fixed controls from appearing as screenshot artifacts.

### Result

The implemented MVP passes the required local functional gates, independent calculation checks and browser/visual inspection. The feature branch is `codex/interactive-mechanics-mvp`. No release, tag, deployment, push or merge occurred. No remote is configured. The initial empty bootstrap commit is `88602a32f952f45a4c6e950e20808503b37fc5c9`; it supplies the Git HEAD required by existing OmniLAB contracts. One implementation commit follows verification; its exact SHA is available from `git log -1 --format=%H` and the final task report.

The final audit confirms the original production configuration SHA-256 remains `51809e7f341aea8f6c10f64400da6a7374d75491c48c32bf46dea015ed999f35`, installed model names/digests are unchanged, and the application configuration differs semantically only in `source_root`, `data_dir` and `selective.project_root`. Its baseline hash matches after LF normalization. Source inspection finds external URLs only in optional material-provenance links; no runtime LLM/cloud client exists. Physics modules import only physics types/validation.

### Known issues and follow-up

- This remains a linear-elastic static analytical teaching model. Clamp contact/crushing, slip, local stress concentrations, buckling, axial load, dynamic response and fatigue life are not calculated. Representative properties are not certified allowables.
- The production JavaScript bundle is approximately 1.19 MB minified / 328 kB gzip and triggers Vite's size advisory. It remains entirely local; future code splitting can reduce initial loading work. Browser diagnostics also include a dependency-level Three.Clock deprecation notice; tested flows have no uncaught page errors.
- Rendering requires WebGL; numerical and educational panels remain available when the 3D renderer fails. Explicit rendering bounds protect graphics from extreme inputs.
- Human learner evaluation, screen-reader testing and physical-device testing remain open. No accessibility certification or physical design validation is claimed.
- Recommended next milestone: a validated seatpost analytical-versus-CalculiX comparison with explicit boundary conditions and mesh convergence, before arbitrary CAD or additional structural lessons. A learner/assistive-technology review can run alongside that planning.

### OmniLAB execution and provenance

Run: `72867d69-ea1e-4552-baf2-7ec7df4b9303`.

Every local job uses the installed tag **`qwen3.8:27b`**, exact manifest identity **`aaee06c39dcf2437cde036998d960e1fc1494b8191be7cc9657d01e509097813`** (Q4_K_M, qwen35 dense 27.3B). Main weight identity: `f5f1dd8920d417aac2718b0bda3403da274301efdd6760b4f0f4b864ff2ad57d`. Ollama version: `0.40.2`; template SHA-256: `b507b9c2f6ca642bffcd06665ea7c91f235fd32daeefdf875a0f938db05fb315`.

The verified qualified profile uses 65,536 context tokens, a 1,536-token output cap, 28 GPU layers, four MTP draft tokens, temperature zero, thinking disabled, 120-second keep-alive, and strict context without truncation or shifting. Runtime evidence records 8,051,543,243 bytes of loaded VRAM. Strata remains disabled. No model was downloaded, replaced, deleted, or reconfigured.

No OmniLAB MCP endpoint was exposed in this session. Codex inspected and used the installed LocalAgentBridge CLI (`0.5.0.dev0`) through its installed CLI, reading the qualified production profile before implementation. Its existing routing/roles/skills, job persistence, correction budgets, handoffs and reviews were used. Each request had bounded context, acceptance criteria, and evidence requirements. Application-owned orchestration state is private under `.omnilab`; the production infrastructure and settings were left untouched. The application-owned configuration changes only repository/data paths from the existing production configuration. The native `local_advisory` lane was used for code/content proposals; these were not OpenHands implementation runs. Existing qualified categories were documentation and small-fix, not greenfield application implementation. The legacy workflow transport could not preserve the qualified exact-profile binding, so contract orchestration was used instead; this limitation is recorded rather than silently switching model/runtime settings.

Existing bounds: eight steps, two implementation attempts, zero transport retries, two self-repair cycles, thirty-minute attempt limit, and fifteen-second local command limit. Codex retained final integration and verification authority. Local agreement was not used as numerical validation.

#### Observed local-execution blockers and fallbacks

1. The required empty Git baseline produces a PAX-only `git archive` that Python `tarfile` rejects. Three initial jobs failed before inference. Codex independently reproduced this and froze the exact empty baseline through the existing snapshot store for linked corrections. No LocalAgentBridge source or model setting was changed. Immutable task context supplied the code needed by each advisory task.
2. Existing admission requires 6 GiB of free host RAM. After inference, the model's keep-alive residency prevented immediate subsequent admission; several jobs failed before inference. Their original failure evidence was retained. A private dispatcher subsequently paused admission after starting one task and waited for natural model unload and the existing memory threshold before resuming the next. Later, observed available RAM rose to 7.52 GiB with the exact model resident, so the application-only helper allowed resident-model reuse when the unchanged 6 GiB gate was satisfied. It still dispatches one job at a time and checks that production has no queued/running work. Otherwise it waits for natural unload. No memory/GPU/context/keep-alive limit was changed.
3. Formula/validation review and architecture review exhausted their two attempts on these pre-inference blockers. Codex performed the independent engineering review and architecture decisions. Trivial unit conversion and factual material-source transcription were also completed by Codex after local admission failures.
4. The first geometry proposal used an incorrect moment field, inconsistent ring indices, and filled rather than annular end faces. It was rejected; a bounded linked correction was requested. No incorrect proposal was accepted on local consensus.

5. Some initial controls/styles proposals and the first implemented-calculation review returned incomplete, overflowed or malformed completions under the existing 1,536-token cap. Failed output was not accepted. Linked corrections requested narrower responses without changing the qualified model or its budgets. Final-attempt source defects were repaired explicitly by Codex and checked independently.

6. Default preview port 4173 was occupied by another application. This project uses checked-free loopback ports 5179 (development) and 4179 (production preview); the existing server was not stopped or modified.

7. The existing run finalizer requires every effective contract to have an accepted candidate. It rejected successful closeout because some budget-exhausted tasks failed and the final reviewer's unsupported findings remained rejected. All 36 attempts were reviewed; no jobs were queued or running. Codex preserved those dispositions and used the existing finalizer to close the orchestration run as `blocked`, with a summary explicitly recording that application verification passed and documented fallbacks were completed. The application-owned controller received a shutdown request. This is an orchestration status limitation, not a failing application check; no acceptance evidence or infrastructure rule was rewritten to produce a green status. Local evidence: `.omnilab/verification/finalize.json`, `finalize-blocked.json`, and `shutdown.json`.

#### Review resolution

The independent local calculation review reported no concrete defect; numerical agreement is established by Codex's executed tests and independent arithmetic, not that opinion. Accessibility review identified a valid live-region lifetime issue: prediction feedback now updates a persistent status region. Its recommendation to expose inactive tab panels was rejected: inactive panels should be hidden. The vertical-arrow concern did not apply to this horizontal tab list. Codex checked [W3C's tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and [ARIA22 status-message guidance](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22) when resolving those findings. No screen-reader certification is claimed.

The final code reviewer suggested removing the scale from the cross-section tilt and warned of a possible mm/SI mismatch without seeing the conversion layer. Both findings were rejected. The displayed tangent is `(1, -scale*w', 0)`, so its dot product with the implemented normal `(scale*w', 1, 0)` is zero. A focused geometry regression checks this using the independent tip-slope benchmark. `App.tsx` passes `toSI(state.inputs)` to the engine; default-case and material/input browser tests verify that boundary. These disagreements were resolved by source inspection, algebra, and executed tests rather than local consensus.

#### Work ownership

Local agents were assigned requirements critique, physics review, architecture, calculation engine, validation, beam sampling, visualization geometry/composition, controls/results, persistence, learning content/panel, FMEA content, styles, and test drafting. Accessibility and final code reviews were completed against bounded actual-source contexts. Codex researched material sources, set public interfaces, authored the independent acceptance oracle, integrated modules, inspected proposals/diffs, repaired specific defects, executed checks, and made acceptance decisions. The ledger below records all 36 actual attempts: 20 succeeded and 16 failed; every attempt has a supervisor disposition. Failed or unsupported proposals were not accepted as evidence.

#### Module-level authorship audit

This classification follows the actual proposal text and integration changes, not job counts or a percentage of lines. A local proposal is code/content returned through the qualified `local_advisory` lane; it is not a claim that OmniLAB edited or tested these files autonomously.

| Modules                                                                                           | Origin                                                             | Codex integration / rewriting                                                                                                                                                |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/physics/beam.ts`                                                                             | Local implementation 09 correction                                 | Retained the engine/equations; repaired immutability, non-finite safety-factor handling and warning thresholds                                                               |
| `src/physics/validate.ts`, `sample.ts`                                                            | Local implementation 08 and 10 corrections                         | Integrated validator diagnostics; sampler retained with independent fixed-oracle tests                                                                                       |
| `src/components/Controls.tsx`, `Results.tsx`                                                      | Local implementation 13 correction and 14                          | Retained components; corrected API/unit imports, accessible labels/semantics, precision and unloaded/hidden-result text                                                      |
| `src/state/session.ts`                                                                            | Local implementation 15                                            | Retained persistence structure; mapped public field names, repaired negative-load guard and froze defaults                                                                   |
| `src/scene/tubeGeometry.ts`                                                                       | Local implementation 12 correction, after rejecting first proposal | Substantial correctness repair to interleaved vertex indices and inner-diameter access; Codex independently verified bore, stress signs and scaled section orientation       |
| `src/scene/BeamScene.tsx`                                                                         | Local implementation 16 correction, after rejecting first proposal | Substantial Codex repair/adaptation of sampling, arrow placement, resource disposal, neutral-line visibility, framing, camera controls, screenshot readiness and rim outline |
| `src/components/LearnPanel.tsx`                                                                   | Local implementation 17                                            | Retained prediction/formula/FBD component; repaired reaction-moment direction, notation, contrast, semantics and persistent live status                                      |
| `src/data/learning.ts`, `fmea.ts`                                                                 | Local content proposals 05 and 06 corrections                      | Substantial engineering curation of material/fatigue language, load paths, glossary and design-action advice; no dynamic generation at runtime                               |
| `src/styles.css`, `src/components/panels.css`                                                     | Local styling proposals 18 correction and 20                       | Substantial desktop/narrow layout and readability refinements following real rendering; `src/interface.css` authored directly by Codex                                       |
| `src/physics/beam.test.ts`                                                                        | Local test implementation 11 correction                            | Retained substantive tests; corrected floating-point literals and lint detail; not treated as independent validation                                                         |
| `src/physics/types.ts`, `units.ts`, `src/data/materials.ts`, `materials.v1.json`, `src/format.ts` | Direct Codex                                                       | Public interfaces, central conversions, source-verified data transcription/loader and display formatting; units/material local tasks failed before inference                 |
| `src/App.tsx`, `src/main.tsx`, `FailurePanel.tsx`, `SceneBoundary.tsx`                            | Direct Codex                                                       | Application integration, tabs, deterministic FMEA table and renderer failure boundary                                                                                        |
| All other original `*.test.ts(x)`, `tests/lesson.spec.ts`, screenshot script                      | Direct Codex                                                       | Independent acceptance, geometry, component, persistence and browser verification; explicit distinction from local test drafts                                               |
| Toolchain, CI, repository setup and consolidated documentation                                    | Direct Codex                                                       | Integration/orchestration and independently recorded evidence; architecture review exhausted local pre-inference attempts                                                    |

<!-- DELEGATION-LEDGER -->

Q27 means the exact tag and manifest identity recorded above. "Requested only" means no successful inference evidence exists; it is not a claim that the model authored output.

| Task                                  | Exact job ID                           | Model evidence     | Execution | Supervisor review | Tokens in/out |
| ------------------------------------- | -------------------------------------- | ------------------ | --------- | ----------------- | ------------- |
| 01-requirements                       | `1f6d98ac-0898-4e29-8c15-7b5234b8422a` | Q27 requested only | failed    | rejected          | —/—           |
| 02-physics-review                     | `bad2045d-4ba7-47fc-ba4d-6a849a56a902` | Q27 requested only | failed    | rejected          | —/—           |
| 03-architecture                       | `066333f8-1a36-4fcf-b67a-6ce2b28701c9` | Q27 requested only | failed    | rejected          | —/—           |
| 01-requirements.correction            | `592e96fc-5817-456c-96d1-177f5367fbdf` | Q27 verified       | succeeded | corrected         | 413/386       |
| 02-physics-review.correction          | `76e7aa40-7f2a-49e9-98ac-d18faf5f033d` | Q27 requested only | failed    | rejected          | —/—           |
| 03-architecture.correction            | `83668c79-6244-467c-bbe5-5d1a9b16e59f` | Q27 requested only | failed    | rejected          | —/—           |
| 04-units                              | `2cd0272d-cc73-482b-9204-78b1d1fd7049` | Q27 requested only | failed    | rejected          | —/—           |
| 05-learning-content                   | `b245c788-ade1-4f45-a376-cc729905a838` | Q27 requested only | failed    | rejected          | —/—           |
| 06-fmea-content                       | `e47681a1-f2a2-4c02-b5cd-39498ceb8002` | Q27 requested only | failed    | rejected          | —/—           |
| 07-material-catalogue                 | `1603e9a1-da7b-4a92-8c90-4225a60d8a43` | Q27 requested only | failed    | rejected          | —/—           |
| 08-input-validation                   | `8f0fd5bf-22f5-4d68-814f-1170fe7ce81d` | Q27 requested only | failed    | rejected          | —/—           |
| 09-calculation-engine                 | `ff642790-f808-4569-9790-c0149c395713` | Q27 requested only | failed    | rejected          | —/—           |
| 10-beam-sampling                      | `36e4d4fb-551e-4ad2-89b9-15e28bc96b4b` | Q27 requested only | failed    | rejected          | —/—           |
| 11-physics-tests                      | `1c4b653e-5085-4240-be81-7a0d21f44643` | Q27 requested only | failed    | rejected          | —/—           |
| 09-calculation-engine.correction      | `2befd5f9-9a61-4c37-9f96-3320e46734fe` | Q27 verified       | succeeded | corrected         | 623/679       |
| 12-tube-geometry                      | `15f2d629-96e9-4535-9169-b131a4b04798` | Q27 verified       | succeeded | rejected          | 633/1529      |
| 13-controls                           | `fb774c85-4e7c-44cf-9174-28d05cb0c9b4` | Q27 requested only | failed    | rejected          | —/—           |
| 14-results                            | `c42eac76-59c5-4b40-8fc1-41219ff32fc6` | Q27 verified       | succeeded | corrected         | 640/993       |
| 15-session-state                      | `3e4f6187-98bb-4bfa-9739-5812c256cadb` | Q27 verified       | succeeded | corrected         | 427/973       |
| 16-scene-composition                  | `9f952b3c-3680-45dd-90bd-9a8f34fbdde0` | Q27 verified       | succeeded | rejected          | 686/1449      |
| 17-learning-panel                     | `e2453e39-bcd4-4543-901e-f4efb9745bc4` | Q27 verified       | succeeded | corrected         | 509/1454      |
| 18-dark-styles                        | `717df048-257e-4d43-9ce3-0e37a46e50e1` | Q27 requested only | failed    | rejected          | —/—           |
| 08-input-validation.correction        | `13795e18-e285-493b-9989-b62c682f3508` | Q27 verified       | succeeded | corrected         | 529/502       |
| 10-beam-sampling.correction           | `9641bd9e-c509-4bb7-ac79-fa9b43f9239b` | Q27 verified       | succeeded | accepted          | 562/352       |
| 05-learning-content.correction        | `4dd6a477-6735-471f-8bee-dbbda9f8ad27` | Q27 verified       | succeeded | corrected         | 475/751       |
| 06-fmea-content.correction            | `a1d64a72-6478-4d63-a257-6219eb2454e8` | Q27 verified       | succeeded | corrected         | 374/615       |
| 11-physics-tests.correction           | `34a07c73-25a5-41a5-b5c3-8342c355bffe` | Q27 verified       | succeeded | corrected         | 715/1476      |
| 12-tube-geometry.correction           | `c7403a13-59fb-4fb0-b4f4-830df9ae2fb0` | Q27 verified       | succeeded | corrected         | 887/1337      |
| 13-controls.correction                | `f3397c16-f647-4b15-b553-ca7467c746cb` | Q27 verified       | succeeded | corrected         | 610/1079      |
| 19-calculation-code-review            | `1460181f-11d7-4230-90ba-c3788dca3586` | Q27 requested only | failed    | rejected          | —/—           |
| 16-scene-composition.correction       | `3df310e6-207d-42c3-985a-56ad680f8d34` | Q27 verified       | succeeded | corrected         | 1030/1437     |
| 18-dark-styles.correction             | `c8c4929f-151c-4c9b-8d9f-1dec24e778b1` | Q27 verified       | succeeded | corrected         | 993/697       |
| 20-panel-styles                       | `1470da78-0daa-406d-b6aa-3865009b93b8` | Q27 verified       | succeeded | corrected         | 746/1517      |
| 21-accessibility-review               | `6c32aa0a-9c85-436b-bc37-f07d220b2fb6` | Q27 verified       | succeeded | corrected         | 5207/635      |
| 19-calculation-code-review.correction | `d46c049a-3595-45ae-8d2d-bd9cadb9edfd` | Q27 verified       | succeeded | accepted          | 2256/133      |
| 22-final-code-review                  | `0f47e886-66a0-4e94-a8f3-7112c9c0d67d` | Q27 verified       | succeeded | rejected          | 5310/233      |

Raw contracts, immutable contexts, candidates, resource/runtime identity evidence, reviews, and verification logs are preserved locally under `.omnilab` (ignored in Git). This ledger is the consolidated public record.
<!-- END-DELEGATION-LEDGER -->

## MVP 0.1 execution follow-up — Windows storage and Firefox (2026-10-11)

### Scope and checkpoint

The application already existed when the execution details arrived. No lesson, physics model, material value/provenance, benchmark, or future extension was added or changed. Codex reran a small calculation/control checkpoint first: 45/45 tests across the independent physics acceptance suite, local engine test draft, results component and App controls/material interactions passed. The App checkpoint mocks the 3D renderer; it is not evidence of a newly built standalone first-screen prototype. The original implementation also retained an earlier 25-test physics checkpoint. This records the actual sequence rather than inventing a development chronology.

### Implementation and provenance

Two bounded implementation tasks were delegated through the unchanged qualified `local_advisory` lane in follow-up run `c2a92a77-1f96-4751-a7af-d1c60f1bd515`, based on the pre-follow-up implementation commit `8d5752473dadfdbc29bb298efd94898b4e373a2f`. All three attempts have verified `qwen3.8:27b` runtime identity `aaee06c39dcf2437cde036998d960e1fc1494b8191be7cc9657d01e509097813`. No qualification, budget, model, GPU, context or infrastructure setting changed.

| Task                                          | Exact job ID                           | Disposition | Module ownership                                                                                                                                                                             |
| --------------------------------------------- | -------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 23 project storage launcher                   | `b9ebc21b-031b-46e4-9618-8f6acbce4678` | Rejected    | Parser-invalid dynamic environment syntax and missing directory handling; not executed/integrated                                                                                            |
| 23 launcher correction (second/final attempt) | `57bba48a-a466-46c6-8624-52e2108465e5` | Corrected   | `scripts/project.ps1` originated locally; substantial Codex repair of argument binding, single-argument array preservation, cleanup coverage and restoration of absent environment variables |
| 24 Firefox/Chromium geometry interactions     | `f917b695-87f4-4930-b75b-92a89e1ba532` | Corrected   | `tests/geometry.spec.ts` originated locally; Codex added exact label matching and corrected its own prompt's rounded wall-3mm stress oracle to 95.85 MPa after independent calculation       |

Codex directly wrote the small project `pnpm-workspace.yaml` settings, cache ignore entries, existing-test Firefox camera inclusion, storage migration/audit, smoke checks and documentation. The earlier module-level audit identifies substantial local implementation origins and all direct work; no "mostly local" claim is inferred from job counts. Local proposals did not execute their own tests.

The existing finalizer still treats the rejected first launcher task as effective even though a separately named correction was reviewed and integrated. A successful closeout request was rejected; the run was closed as `blocked` with all dispositions preserved and a summary that application verification passed. The app-owned controller received shutdown. No rejected proposal was relabelled accepted and no infrastructure rule was changed. Raw evidence is under `.omnilab/verification/followup-*` and the proposal/review directories.

### Storage and Windows launch verification

- Repository, dependencies, browser binaries, test profiles/download temporaries, caches, logs, reports, screenshots and build outputs are on D:. `pnpm-workspace.yaml` places the store/metadata cache in `.cache`; the PowerShell launcher sets browser, temporary, npm-cache and pnpm-state paths for the child and restores its caller environment afterward.
- The previous project-created C: Playwright cache contained 1,293,850,079 bytes (approximately 1.2 GiB) and had exactly one reference, to this project. Its path boundaries and contents were checked before moving it to `.cache/ms-playwright` within the project. The C: source no longer exists. No unrelated cache or browser profile was moved.
- The earlier shared dependency store (outside this project) remains untouched. This project's dependencies were reinstalled from the unchanged lockfile into `.cache/pnpm-store`; the first attempted checkpoint correctly stopped on pnpm's store mismatch, before tests ran. The checkpoint passed after this project-only reinstall.
- An existing shared `%LOCALAPPDATA%/pnpm-cache` occupied 184,022,786 bytes (175.5 MiB) at audit. Ownership of its individual entries was not established, so it was not moved or deleted. It may include metadata from the earlier run. New project cache/state writes use D:. Existing Node/pnpm/PowerShell executables and OS/Codex-managed files remain on C:; these are not relocated by the project.
- PowerShell 7.6.5 successfully runs `pwsh -NoProfile -File .\scripts\project.ps1 ...`. Windows PowerShell 5.1 rejects scripts under its existing execution policy; no policy was changed. Use the documented PowerShell 7 command, not `powershell -File`.
- Launcher checks covered syntax, D: paths, spaces and literal flag forwarding, nonzero child exit-code propagation, restoration of absent/existing environment variables and working directory, single-argument preview, and the no-argument default development server from outside the repository. The default-dev and explicit-preview HTTP checks returned 200 with the expected title. Only this app's verified development smoke-test process was stopped; preview remains on 127.0.0.1:4179.

### Automated verification and manual status

| Check                                                         | Actual result                                                                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Small calculation/control checkpoint                          | 45/45 passed before full browser rerun                                                                                                                              |
| Frozen-lockfile install through launcher                      | Passed                                                                                                                                                              |
| Lint / strict type check / full unit tests / production build | Passed; 78/78 unit tests; unchanged build assets                                                                                                                    |
| Full browser suite                                            | 12/12 passed in 65.0 seconds; four scenarios each in Firefox, Chromium and WebKit; zero skipped/flaky/unexpected                                                    |
| Primary browsers through documented launcher                  | 8/8 Firefox/Chromium tests passed in 27.2 seconds                                                                                                                   |
| Firefox rendering                                             | Actual Firefox 157.0 from D: rendered the scene and camera presets; zero uncaught page errors; Codex visually inspected `artifacts/screenshots/firefox-explore.png` |
| Existing user Firefox manual check                            | **Not run**: browser-control helper exited unexpectedly on initialization and once after reset; no existing browser profile was altered                             |
| Human learner / screen-reader / physical-device checks        | Not run; remain follow-up work                                                                                                                                      |

Critical scenarios cover numerical/material/geometry controls, invalid geometry recovery, displacement-scale isolation, prediction/reveal and FMEA keyboard navigation, local persistence, external-service isolation and narrow layout. Firefox now shares Chromium's explicit 3D readiness and camera-control assertions. Additional geometry cases use fixed independently checked displayed values; for a 30 mm outer diameter and 3 mm wall, `I = 7472.25π mm⁴`, stress is `95.847601982 MPa` and displacement is `2.806664773 mm` at the existing 500 N / 300 mm / 68.3 GPa benchmark conditions.

Exact commands and local Firefox-opening instructions are consolidated in README. Screenshots retain the same production asset identities (`index-BEmtK7UN.js`, `index-DtCIPmpA.css`). No source physics/material/benchmark file changed; no remote, push, merge, tag, release or deployment occurred. Remaining limitations and recommended next milestone are unchanged. The original implementation commit is amended after these checks to retain one implementation commit after the empty baseline; final SHA is in the task report and `git log -1 --format=%H`.

## MVP publication preparation (2026-10-12)

### Scope and current publication status

Inspected the complete implementation at `48df748d7c9ca903239110eb4edf234faf7a07b9`, preserved it, and created `codex/github-pages-publication`. The starting tree was clean, with no remote or local main branch. Read-only GitHub discovery resolved the personal account `nishdel`; no matching repository was found, and the intended project Pages URL returned 404. No existing deployment or hosting resource was changed.

Prepared the GitHub Pages workflow, configurable Vite asset base, subpath-aware browser tests, page/sharing metadata, public README, four genuine screenshots, and third-party runtime notices. The source lesson, calculations, material catalogue, benchmark and learning/FMEA content are unchanged. No license decision was recorded, so no license for the original project source has been introduced.

**Prepared locally only.** GitHub repository creation, upload, PR, merge, hosted validation and deployment remain pending. The unpublished history contains the owner's personal author email and machine-specific paths. The user requested stopping affected publication when personal data is found and prohibited rewriting history. A metadata publication decision has been requested; no historical record was rewritten or uploaded. Pattern scans found no credential matches, committed dependency caches or unrelated private logs. This is a scoped inspection, not a guarantee that automated scanning detects every secret.

### Verification

| Check                                    | Actual local result                                                                                                                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen-lockfile install                  | Passed through the D:-scoped Windows launcher                                                                                                                                       |
| ESLint, formatting and strict TypeScript | Passed                                                                                                                                                                              |
| Unit/component suite                     | 78/78 passed across 10 files                                                                                                                                                        |
| Default-root production build            | Passed; Firefox rendered the 3D scene, changed load and retained state on refresh                                                                                                   |
| Pages-subpath production build           | Passed at `/InteractiveMechanicsLab/`; all referenced assets resolve below that prefix                                                                                              |
| Full subpath browser suite               | 12/12 passed, 70.6 seconds; four tests each in Chromium, Firefox and WebKit; zero skipped, flaky or unexpected results                                                              |
| Screenshot capture                       | Four real production JPEGs, 808,747 bytes total; 3D readiness and expected numerical states asserted; no page errors, console errors or failed asset responses                      |
| Screenshot inspection                    | Codex visually inspected all four images; no EXIF fields or personal browser chrome; mobile content stacks without horizontal page overflow                                         |
| Artifact and README audit                | Relative document/image links exist; build contains only intended static assets and notices; no source maps or credential/machine-path pattern findings in newly prepared artifacts |
| GitHub Actions / live website            | Not run: upload awaits the metadata decision                                                                                                                                        |
| Owner's manual acceptance                | Not completed; not replaced by automated browser tests                                                                                                                              |

The existing full-precision benchmark and unit tolerances remain in `PHYSICS-VALIDATION.md`. Codex independently recalculated its section properties, moment, stress, displacement, mass and safety factor with 50-digit decimal arithmetic; every documented value matched within 1e-8 relative tolerance. Browser assertions use the displayed precision: 500 N aluminium gives 129.84 MPa and 3.802 mm; 1000 N titanium gives 259.68 MPa and 5.194 mm. Deformation scaling remains independent of calculated displacement. Tests exercise invalid geometry/recovery, material and geometry changes, learning/FMEA keyboard interaction, persistence, external-service isolation and mobile layout. Firefox and Chromium explicitly assert 3D readiness and camera behavior.

Public captures are `docs/screenshots/desktop.jpg` (1440×1000), `comparison.jpg` (1440×1000), `learning.jpg` (1392×2415), and `mobile.jpg` (390×3536). They were captured from the built app using Chromium 156.0.8078.4 with a fresh browser context; JPEG quality 82. The screenshot script is reproducible and fails on capture errors. Private reports remain under ignored `.omnilab/verification/publication-*` on D:.

### Publication workflow and provenance

Official action releases were checked against upstream release/ref metadata and action manifests, then pinned by commit: checkout v7.0.1, setup-node v7.1.0, pnpm/action-setup v6.1.0, configure-pages v6.0.0, upload-pages-artifact v5.0.0 and deploy-pages v5.0.1. See the exact revisions in `.github/workflows/ci.yml`. Node 24 and pnpm 11.25.0 are explicit; installation uses the existing frozen lockfile. PR validation has read-only repository permissions. Only a validated main run can upload `dist/`; its dependent deployment job receives Pages/OIDC permissions and uses the `github-pages` environment. Repository Pages settings still need to be set to GitHub Actions when publication can proceed. Official references: [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Vite GitHub Pages deployment](https://vite.dev/guide/static-deploy.html#github-pages).

Existing OmniLAB CLI, routing, exact-profile binding, persistence, review and correction budgets were reused in run `830947a5-7f50-46fe-a96b-622048d6d348`. All four tasks were routed to `qwen3.8:27b`, exact manifest `aaee06c39dcf2437cde036998d960e1fc1494b8191be7cc9657d01e509097813`, through the already qualified native `local_advisory` proposal lane. The production configuration hash remained `51809e7f341aea8f6c10f64400da6a7374d75491c48c32bf46dea015ed999f35`. No qualification, model, Ollama, GPU, context, Strata or infrastructure setting changed. Local output was inspected and executed by Codex, not treated as evidence by itself.

| Bounded task                     | Exact job ID                           | Origin and integration                                                                                                                                                         |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 25 Pages workflow                | `bc6689c8-6d7f-499b-a23d-e43a7340c516` | Local YAML proposal retained; Codex adjusted workflow name/setup ordering and annotated verified release pins                                                                  |
| 26 subpath browser configuration | `655e4c37-0d05-4cee-9685-d34e73d1176b` | Local Vite/Playwright configuration retained; Codex corrected the proposed request-isolation patch to preserve existing blocking/assertions                                    |
| 27 production screenshot script  | `2573cebe-ff23-4784-ab40-a0ce8eb0647a` | Local script retained; Codex corrected selectors against actual accessible labels/roles, serialized error messages and widened failed-response checks to the same origin       |
| 28 independent workflow review   | `11d4da63-ff47-46b1-af2f-c1350e688f56` | Failed before a usable proposal: incomplete/overflowed/malformed provider completion; rejected. Codex performed final source/security review; hosted execution remains pending |

The three implementation proposals returned matching exact runtime identity evidence and were recorded as corrected after independent verification. The failed review retains its exact requested identity but returned no usable completion/runtime report. The review attempt produced no usable output and was recorded as rejected; no unsupported local conclusion was accepted. Codex inspected the full workflow and official action manifests, including event/permission gates and artifact scope. This documented local-review failure did not change models, qualification or budgets. The app-owned run was closed as `blocked`, with the failure and pending publication decision preserved; only its controller received shutdown. This is separate from the passing local application checks.

Codex directly wrote the README/history updates, small page metadata/favicon integration, exact third-party notice transcription, private audit/smoke-check helpers, and final integration evidence. These were bounded publication/integration work; no substantive application module was rewritten. Existing implementation ownership remains documented above.

### Remaining manual checklist and follow-up

- Resolve the pending decision about existing personal metadata before any upload; preserve history.
- Recheck for an existing repository, create/reuse the intended personal repository, and open a PR containing the full MVP plus publication changes against main.
- Inspect GitHub's rendered README/screenshots, run hosted checks and satisfy applicable protections/approvals before normal merge.
- Configure Pages to use Actions, verify deployment from final main, and exercise the actual public URL in a fresh unauthenticated browser session. Set repository description/homepage to the verified live demo.
- The owner should review the lesson in their existing Firefox, try the controls/invalid inputs, read assumptions and FMEA, and assess educational clarity. Existing-profile manual Firefox, assistive-technology and physical-device checks have not been run for publication.

Known limits remain unchanged: analytical static beam idealization, no fatigue-life/contact/certification claims, a large Three.js bundle, and a non-blocking dependency clock deprecation. The recommended immediate next step is completing this publication and human acceptance, without expanding the simulation.

## Sanitized publication candidate (2026-10-12)

The publication candidate is a separate, reviewed file export. Its public Git history will start fresh; the original development repository and history remain local and are not attached as parents, alternates, remotes or copied Git metadata. Publishing, pushing, PR creation and deployment are explicitly blocked for this privacy task. Earlier execution results above describe the local development history; they do not imply those historical commits or private evidence are distributed.

Machine-specific documentation paths were replaced with project-relative paths or neutral environment-variable examples. The legacy `artifacts/screenshots/` evidence bundle is retained only in the original local repository; current public images are the four genuine captures under `docs/screenshots/`. Runtime application source, materials, physics, tests, lockfile and third-party notices remain unchanged. Required third-party names, copyright statements and licenses are preserved; they are not the owner's private identity.

New author and committer metadata must use the verified public GitHub username and actual GitHub-provided noreply address, configured only in the publication repository. No personal address fallback is allowed. The global Git configuration and original repository identity settings are left unchanged.

The sanitized copy passed frozen-lockfile installation, lint, formatting, strict TypeScript, all 78 unit/component tests, the production build and all 12 Playwright tests (four each in Chromium, Firefox and WebKit). The build's five output files are byte-identical to the previously verified original build. The four production screenshots were regenerated and visually inspected; no page, console or asset errors were reported. Known private-identity and machine-path scans found no matches in the clean production output. The owner's manual acceptance remains outstanding.

A bounded read-only export-verifier proposal was delegated in OmniLAB run `7f5b65b7-654b-4a4b-a677-4ad265616aa1`, job `c53e9072-8d03-44b3-9afe-8c66691273b3`, using `qwen3.8:27b` with exact runtime identity `aaee06c39dcf2437cde036998d960e1fc1494b8191be7cc9657d01e509097813`. Codex corrected newline handling, path containment, complete file-set checks and fail-closed scanning in the private helper. Nine synthetic verification cases passed. Codex performed the sensitive source investigation, narrow documentation edits, transfer, independent checks and final decisions. Audit helpers and evidence are outside the publication repository; no original Git metadata was copied. No model or shared infrastructure setting changed.

An early formatting command overlapped the first dependency installation and left an incomplete generated dependency link. The damaged generated tree was moved into the private audit workspace; a fresh serialized installation from the unchanged lockfile resolved it. All final validation gates passed afterward. This did not alter original project files, runtime source or tests. No project license was selected, and existing third-party attribution was retained.

## Sanitized public preview (2026-10-12)

This milestone supersedes the earlier cleanup-only publication block. Only the sanitized repository is used for public development. Its root is `b22f721286dd4d1f2e2c7392b2f55094f76127c4`; the original repository, history, privacy audit and excluded evidence remain local. Reinspection found one parentless root, verified public noreply metadata, 62 reviewed tracked files, and no private-value or credential-pattern findings. No original Git objects, alternates or remotes were transferred. The original archive and shared Git identity settings were preserved.

The public repository is [nishdel/InteractiveMechanicsLab](https://github.com/nishdel/InteractiveMechanicsLab). GitHub Pages is configured with Actions as its source at [the demo URL](https://nishdel.github.io/InteractiveMechanicsLab/). The public README and all four genuine screenshots were inspected without signing in. No project license was selected; third-party notices are preserved. Owner manual acceptance is still outstanding.

Local verification passed lint, formatting, strict TypeScript, all 78 unit/component tests, the Pages-subpath production build, and all 12 browser tests in Chromium, Firefox and WebKit. The application, physics, material data and browser assertions remain unchanged.

The [first hosted run](https://github.com/nishdel/InteractiveMechanicsLab/actions/runs/38308896452) passed installation, lint, formatting, types, unit tests and build, but failed Firefox's 3D readiness assertion; 11 of 12 browser cases passed and deployment was correctly skipped. The Linux CI command now runs the complete browser suite headed under Xvfb, which supplies a virtual display for Firefox's GL context. This follows [Playwright's Linux headed-CI guidance](https://playwright.dev/docs/ci#running-headed); no assertion, test project or failure gate was removed. [PR #1](https://github.com/nishdel/InteractiveMechanicsLab/pull/1) then passed all hosted checks, including 78 unit/component tests and 12 browser tests, with deployment correctly skipped for the PR. It was merged after checking repository requirements. The merge was created with the verified public noreply author and committer identity; no protections or approvals were bypassed.

The [main validation and deployment](https://github.com/nishdel/InteractiveMechanicsLab/actions/runs/38309781254) succeeded for `923d6388687a639d98caaa8db4d0224203aca5ad`. The deployed public HTTPS site then passed all 12 interaction tests again in fresh, unauthenticated Chromium, Firefox and WebKit sessions. These exercised geometry/material/load changes, invalid inputs and recovery, visualization-only deformation scale, prediction/reveal, keyboard FMEA navigation, refresh/persistence, external-service isolation and narrow layout. Firefox and Chromium retained explicit 3D readiness and camera checks.

Codex also opened the real public app without signing in, visually inspected its rendered 3D scene, and changed the load/material to obtain the expected 259.68 MPa and 5.194 mm. Four fresh live captures produced zero uncaught page errors, console errors or failed assets. The served HTML, JavaScript, CSS and favicon exactly matched the inspected production build. Third-party notices matched after CRLF/LF normalization; their attribution and license text were preserved. GitHub's rendered README and all four embedded screenshots loaded anonymously. The repository homepage points to the verified demo. Private browser reports/captures stay excluded from Git. Subsequent main updates automatically repeat validation before deployment; the workflow uses only the standard GitHub token and deploys only `dist/`.

A bounded OmniLAB publication review ran as job `fa5e71aa-f0f0-4e3a-9c1e-20065ae5994c` in run `f360b892-f4cc-4695-8903-7a5d51122ae2`, using `qwen3.8:27b` with observed runtime identity `aaee06c39dcf2437cde036998d960e1fc1494b8191be7cc9657d01e509097813`. Codex rejected unsupported suggestions to add Pages-write permission to the upload job or treat a missing project license/owner manual acceptance as newly required approval gates. The valid reminder to verify hosted execution was retained. The review was recorded as corrected and the project-owned run finalized. Codex directly performed publication, privacy checks, documentation integration, the small Xvfb CI correction and independent live verification; no application module was rewritten. No model or shared infrastructure configuration changed.

Remaining manual checks: the owner should try the lesson in their existing Firefox profile, assess explanation and FMEA clarity, and perform assistive-technology and physical-device checks. The model remains an educational static analytical beam idealization, with no fatigue-life, clamp/contact or certification claim. Known bundle-size and dependency deprecation advisories remain. Recommended next milestone: owner acceptance and focused accessibility feedback, without expanding the simulation.

## Future milestones

For each future milestone, add scope, automated verification, manual checklist, result, known issues, and follow-up work to this document. Preserve earlier results and update only corrections that are explicitly identified.
