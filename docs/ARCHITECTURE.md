# Architecture

## Data flow

```text
Labelled display inputs (N, mm) + selected material + saved browser session
                  |
                  v
        physics/units.ts: explicit SI conversion
                  |
                  v
        physics/beam.ts -> immutable CalculationOutcome
                 / \
                v   v
      numerical UI   scene sampling -> Three.js tube mesh
                           ^
                  visual scale only here
```

React owns session and presentation state. The calculation engine receives a read-only SI input and a separate material-properties record. It has no React, browser, JSON, network, or rendering imports. Invalid cases return errors instead of stale results; model-applicability warnings accompany mathematically defined cases.

## Module responsibilities

| Module                            | Responsibility                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/physics/types.ts`            | Public immutable input/result/diagnostic contracts                                           |
| `src/physics/units.ts`            | Central display/SI unit boundary, including area and fourth-power units                      |
| `src/physics/validate.ts`         | Finite values, positive geometry/material properties, hollow-section constraints             |
| `src/physics/beam.ts`             | Section properties, moment, stress, displacement, mass, yield margin, model warnings         |
| `src/physics/sample.ts`           | Position-dependent bending moment, signed fibre stress, slope, and deflection                |
| `src/data/materials.v1.json`      | Versioned, sourced and condition-specific material examples                                  |
| `src/data/materials.ts`           | Validate and freeze the material catalogue                                                   |
| `src/data/learning.ts`, `fmea.ts` | Deterministic educational content                                                            |
| `src/scene/`                      | R3F scene and hollow tube geometry; visual scaling never feeds back into physics             |
| `src/components/`                 | Labelled controls, results, prediction activity, FMEA, WebGL fallback                        |
| `src/state/session.ts`            | Versioned localStorage persistence with defensive parsing and usable fallback                |
| `src/App.tsx`                     | Composition, calculations from current input, mode navigation, and interpretation boundaries |

The scene uses ordinary Three.js geometry and local code. Its triangles are graphics tessellation, not finite elements; future mesh generation means a separately validated analysis mesh. There are no remote textures, font loaders, CAD assets, backend services, or runtime AI calls. A signed colour legend is paired with numeric values and textual tension/compression labels. Its range follows each case; colours alone must not be used to compare cases. A separate deformation multiplier affects coordinates only.

A WebGL error boundary preserves the numerical and educational UI. Valid calculations beyond explicitly stated rendering bounds remain visible as numbers while the 3D region explains its limit. This protects the renderer from enormous finite inputs without silently changing the engineering model.

## Session and accessibility

Only the last valid lesson state is stored under `interactive-mechanics-lab:v1`. Unknown versions, corrupt JSON, unknown materials, invalid geometry, and inaccessible storage revert to a fresh default session. No account, telemetry, or synchronization exists. The UI uses native labelled controls, semantic headings/tables, a keyboard tab pattern for learning modes, visible focus, and textual equivalents for visual meaning. The FMEA table scrolls within its own labelled, focusable region at narrow widths.

## Verification boundary

Production calculations are deterministic equations. Independently protected acceptance tests use fixed values calculated separately in N-mm, not expected values produced by the application formulas. Component tests exercise input/result/persistence transitions with a scene stand-in. Playwright exercises the built application in real browsers, including offline service isolation and keyboard interaction. Geometry tests inspect mesh stress, positions, and orientation independently of screenshots. Screenshots support visual inspection; they do not prove numerical accuracy.

TypeScript strict mode, ESLint, Prettier, Vitest, and a production build form the basic local/CI checks. Browser checks run against the generated static build. Exact commands and actual results belong in the single living history/testing document.

## Development orchestration

OmniLAB is outside the runtime architecture. Its existing installed qualified profile is used for bounded persisted local advisory proposals, with explicit context, acceptance criteria, review, and supervisor decisions. Local output is untrusted until inspected and tested. Private job state is ignored under `.omnilab`; the public history records exact job/model identities and outcomes. No application module imports development infrastructure.

## Static publication

GitHub Pages hosts only the generated `dist/` files; it adds no application backend. `VITE_BASE_PATH` sets the production asset prefix (`/InteractiveMechanicsLab/` for the project Pages URL), while local development defaults to `/`. Learning modes are in-page React state rather than client-side URL routes, so there are no deep-route rewrite requirements. Refreshing the project URL restores the last valid browser session.

The single Actions workflow validates pull requests with read-only repository permissions. On a push to `main`, the same workflow validates that exact commit, builds and browser-tests its subpath output, then uploads only `dist/`. A dependent main-only job receives Pages/OIDC permissions and deploys into the `github-pages` environment. No personal token is stored in the repository. Official action revisions are pinned to reviewed release commits. The deployed output includes third-party notices; no project license is implied.

## Future extension points (not implemented)

| Extension                          | Boundary to preserve                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| Crank arm                          | New lesson geometry, bending/torsion loading, validation oracle                             |
| Bicycle fork                       | Multi-member constraints and distinct load cases                                            |
| Simplified frame                   | Member/joint idealization and load-path teaching                                            |
| Wheel and spokes                   | Pre-tension and tension-only behavior                                                       |
| Mesh generation                    | Separate geometry/mesh validation with explicit quality metrics                             |
| CalculiX                           | Optional local solver adapter; execution and result provenance outside UI/analytical engine |
| Analytical versus FEA              | Map both into documented observable quantities, units, load cases, and error measures       |
| Fatigue S-N curves                 | Sourced condition-specific curves, stress history, mean stress, finish/environment effects  |
| Arbitrary CAD                      | Import/repair, units, topology, meshing, boundary conditions, and solver robustness         |
| Nonlinear/contact/dynamic analysis | New constitutive/contact/time models and independent validation; no reuse of linear claims  |

The current typed SI contracts provide a small comparison boundary for a future FEA adapter. That backend would need to report its mesh, solver/version, boundary conditions, convergence, and assumptions; equal-looking stress colours would not establish agreement.

Arbitrary CAD and full FEA are deliberately outside the MVP. CAD geometry does not supply supports, loads, contact, material condition, mesh quality, or credible convergence. Adding an upload button without these would obscure the lesson and produce misleading confidence. The single analytical lesson establishes inspectable equations and validation before adding solver complexity.
