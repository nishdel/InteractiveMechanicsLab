# Physics and calculation validation

## Model and coordinates

This lesson uses an analytical Euler–Bernoulli cantilever beam, not finite-element analysis. The seatpost is deliberately rotated horizontally: x runs from the fixed clamp boundary (x = 0) to the free end (x = L), y points upwards, and F is a downward transverse tip load. A vertical force on an upright seatpost would introduce axial compression and possibly bending through inclination/offset; that real assembly is not represented by these equations.

Assumptions: constant circular hollow section; homogeneous isotropic material at room temperature; linear elasticity; small displacement and rotation; an ideal rigid clamp; a concentrated transverse tip force; negligible shear deformation. Exposed length alone contributes to displayed component mass. Clamp hardware, saddle, inserted tube, self-weight, axial load, torsion, contact, holes, welds, residual stress, and manufacturing defects are omitted.

## Equations and units

All calculation inputs and outputs use SI. Display conversion is centralized in the units module. Millimetres convert by 10^-3, MPa by 10^6, GPa by 10^9, square metres to square millimetres by 10^6, fourth-power metres to fourth-power millimetres by 10^12, and kg to g by 10^3.

| Symbol       | Meaning                                                              | SI unit       |
| ------------ | -------------------------------------------------------------------- | ------------- |
| F            | Nonnegative transverse force magnitude                               | N             |
| L            | Exposed beam length                                                  | m             |
| Do, Di, t, c | Outer diameter, inner diameter, wall thickness, outer-fibre distance | m             |
| A            | Section area                                                         | m²            |
| I            | Second moment of area about the neutral bending axis                 | m⁴            |
| E            | Elastic modulus                                                      | Pa            |
| rho          | Density                                                              | kg/m³         |
| M            | Bending moment magnitude                                             | N·m           |
| sigma        | Normal bending stress; tension positive                              | Pa            |
| delta        | Downward tip displacement magnitude                                  | m             |
| sy           | Representative yield strength                                        | Pa            |
| n            | Yield-based safety factor                                            | Dimensionless |

- Di = Do - 2t; c = Do / 2.
- A = pi(Do² - Di²) / 4.
- I = pi(Do⁴ - Di⁴) / 64.
- Mmax = FL.
- sigmaMax = Mmax c / I.
- delta = FL³ / (3EI).
- mass = rho A L.
- n = sy / sigmaMax for nonzero load.

At position x: moment magnitude M(x) = F(L-x); signed displacement y(x) = -F x²(3L-x)/(6EI); slope y'(x) = -F x(2L-x)/(2EI). Signed stress at section coordinate ySection is F(L-x)ySection/I. Thus upper fibres are in tension and lower fibres in compression. The neutral axis of each cross-section is ySection = 0. The centreline connects section centroids; it is distinguished from the cross-section neutral axis in the lesson.

For the exaggerated display curve, the tangent is `(1, -s*w'(x), 0)` where s is the visual multiplier and w is downward displacement. The section normal `(s*w'(x), 1, 0)` is perpendicular to it. Graphics tests permit a 3e-6 normalised dot-product residual because GPU vertex positions use Float32; numerical engine benchmarks still use 1e-8 relative error.

Boundary checks: y(0) = 0, y'(0) = 0, M(L) = 0, y(L) = -delta. The ideal clamp peak is nominal section stress, not a computed local contact concentration or singularity.

## Independent benchmark A: 6061-T6 tube

Inputs: F = 500 N; L = 300 mm = 0.3 m; Do = 30 mm = 0.03 m; t = 2 mm = 0.002 m; E = 68.3 GPa = 68,300 N/mm² = 68.3e9 Pa; rho = 2,700 kg/m³; sy = 276 MPa = 276e6 Pa.

Independent hand reduction in N–mm units, then evaluated by Codex with 48-digit Decimal arithmetic without importing the application:

| Step                    | Substitution / expected value                                               |
| ----------------------- | --------------------------------------------------------------------------- |
| Di                      | 30 - 2(2) = 26 mm = 0.026 m                                                 |
| c                       | 30 / 2 = 15 mm = 0.015 m                                                    |
| Area difference         | 30² - 26² = 224 mm²                                                         |
| A                       | 224 pi / 4 = 56 pi = 175.9291886010284 mm² = 1.759291886010284e-4 m²        |
| Fourth-power difference | 30⁴ - 26⁴ = 353,024 mm⁴                                                     |
| I                       | 353024 pi / 64 = 5516 pi = 17,329.02507720130 mm⁴ = 1.732902507720130e-8 m⁴ |
| Mmax                    | 500 × 300 = 150,000 N·mm = 150 N·m                                          |
| EI                      | 68,300 × 17,329.02507720130 = 1,183,572,412.772849 N·mm²                    |
| sigmaMax                | 150000 × 15 / I = 129.8399644513287 MPa                                     |
| delta                   | 500 × 300³ / (3EI) = 3.802048739423973 mm = 0.003802048739423973 m          |
| mass                    | 2700 × A(SI) × 0.3 = 0.1425026427668330 kg = 142.5026427668330 g            |
| Yield safety factor     | 276 / 129.8399644513287 = 2.125693742803359                                 |

For nonzero benchmark values, acceptance is absolute difference / absolute expected value <= 1e-8. Zero quantities are checked exactly. UI numbers are checked within half of the last displayed unit. This floating-point tolerance verifies arithmetic, not material-property accuracy or physical-model validity.

## Independent benchmark B: diameter change at fixed wall thickness

Keep benchmark A's F, L, t, E, density, and yield strength, but set Do = 40 mm. Then Di = 36 mm and c = 20 mm. The area difference is 304 mm², so A = 76 pi = 238.7610416728243 mm². The fourth-power difference is 880,384 mm⁴, so I = 13,756 pi = 43,215.74854278120 mm⁴. Mmax remains 150,000 N·mm.

Expected stress = 3,000,000 / I = 69.41913772545595 MPa; displacement = 500 × 300³ / (3 × 68,300 × I) = 1.524578427352620 mm; mass = 0.1933964437549877 kg; yield safety factor = 3.975848865935870. Use the same 1e-8 relative tolerance.

I increases by 13,756 / 5,516 = 2.493836113125453, while mass increases by 76 / 56 = 1.357142857142857. This explicitly tests the fixed-wall diameter control, rather than assuming all dimensions scale together. L/Do = 7.5 also triggers the short-beam educational warning. This benchmark verifies arithmetic; it does not remove that model-applicability caution.

## Additional cases and invariants

- Zero load: stress, bending moment and displacement are zero; mass and section properties are unchanged. Safety factor is displayed as unloaded/not applicable, not a finite safety claim.
- Double F at unchanged geometry: stress, moment and displacement double; safety factor halves; mass is unchanged.
- Double L: moment/stress/mass double and displacement multiplies by eight.
- Change only E: displacement varies inversely; nominal force-controlled bending stress is unchanged.
- Change only yield strength: only yield safety factor changes. Change only density: only mass changes.
- Uniformly scale both tube diameters: area scales quadratically and I to the fourth power. With fixed thin wall thickness, I is approximately proportional to diameter cubed; do not teach a universal diameter-to-the-fourth rule.
- Reject nonfinite values, F < 0, L <= 0, Do <= 0, t <= 0, t >= Do/2 (including Di = 0), and Di < 0. Reject invalid material properties and nonfinite calculated results.
- Visual deformation multipliers never enter numerical calculations or stress values.

## Material provenance, catalogue version 1

Values below are educational examples for particular alloy conditions, not certified design allowables. They do not establish compliance, safe riding loads, or suitability of a purchased component. Published typical values and minima are explicitly distinguished. Sources accessed 2026-10-11.

| Example                                        | E (GPa) | Density (kg/m³) | Yield (MPa) | Selection                                                                                            |
| ---------------------------------------------- | ------: | --------------: | ----------: | ---------------------------------------------------------------------------------------------------- |
| Reynolds 953 maraging stainless bicycle tubing |     200 |           7,790 |       1,500 | Lower end of published 1,500–1,900 MPa yield range; this is a high-strength alloy, not generic steel |
| Aluminium 6061-T6                              |    68.3 |           2,700 |         276 | Published typical T6 properties                                                                      |
| Annealed Ti-3Al-2.5V                           |     100 |           4,480 |         483 | E is midpoint of 95–105 GPa range; yield is listed annealed minimum                                  |

Steel: [Reynolds materials FAQ](https://www.reynoldstechnology.biz/faqs-on-reynolds-steel-tubing/materials/), Reynolds 953 section. Do not substitute the manufacturer's UTS values for yield strength.

Aluminium: [Kaiser extruded shapes data](https://online.kaiseraluminum.com/depot/PublicProductInformation/Document/1006/Kaiser_Aluminum_Shapes_Soft_Alloy.pdf), printed 6061 pages 2–3 (PDF indexes 1–2), KA-SH-6061-1.09. The table lists 68.3 GPa; retain this explicit source value rather than silently replacing it with a different rounded modulus.

Titanium: [TIMETAL 3-2.5 datasheet](https://www.timet.com/documents/datasheets/alpha-and-beta-alloys/timetal-3-2.5.pdf), first page, tables 2–3 (1997). No averaged yield across annealed, aged and cold-worked conditions is used.

## Limits and warning interpretation

Invalid inputs produce no calculated result. At or beyond representative yield, the reported linear-elastic estimate does not predict permanent bending or true post-yield displacement. The lesson additionally cautions when delta/L > 0.05 or L/Do < 10. These are declared educational screening heuristics, not universal error bounds or certification rules.

Fatigue cracking, local clamp crushing/ovalisation, slippage, and insufficient insertion are qualitative FMEA topics. The equations do not calculate their capacity or likelihood. Fatigue requires load histories, mean stress, material/condition-specific fatigue data, geometry and stress concentrations, surface/environment effects and validation. A static safety factor cannot supply cycles to failure.

Arbitrary CAD import and full FEA are outside the MVP because geometry repair, mesh generation/convergence, boundary conditions, solver operation and verification form a separate engineering workflow. A smooth colour plot is not evidence that assumptions are correct.

## FMEA curation boundary

The FMEA is a qualitative design-review aid, not a risk score, maintenance procedure, or component approval. Only nominal yielding is connected to a calculated scalar here. Cyclic damage, contact pressure, retention, and engagement require separate engineering validation. The curated text avoids universal interface-preparation rules and universal inspection methods; assembly and inspection depend on the actual frame, post, material, and manufacturer instructions.

Examples supporting that restraint are [Trek's lubricant/interface instructions](https://www.trekbikes.com/nz/en_NZ/owners-manual/lubricants-and-threadlockers/) and [Ritchey's product-manual and inspection guidance](https://ritcheylogic.com/product-user-manuals), accessed 2026-10-11. Their product-specific instructions are not converted into generic torque values, insertion lengths, or service intervals in this application. The proposed design actions remain reviewed engineering discussion prompts.

## Verification record

Execution results, manual/visual inspection, screenshots and job dispositions are recorded in the single living PROJECT-HISTORY-AND-MANUAL-TESTING document. Test expectations are fixed from the independent calculations above, not derived by calling the production formula from the test oracle.
