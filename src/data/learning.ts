export const learningSections = [
  {
    id: 'free-body',
    title: 'Free-Body Diagrams',
    body: 'The tip force acts downward. The clamp supplies an equal upward reaction and a counterclockwise reaction moment FL. Internal shear and bending carry the load along the tube to the clamp and into the frame.',
  },
  {
    id: 'diameter',
    title: 'Diameter Scaling',
    body: 'Material farther from the neutral axis contributes more to the second moment of area I, so a wider tube can bend less. I scales with diameter to the fourth power when both diameters scale together. With a fixed thin wall thickness, it grows approximately with diameter cubed.',
  },
  {
    id: 'modulus',
    title: 'Modulus Effects',
    body: 'Elastic modulus E measures resistance to elastic strain. Increasing E alone reduces displacement. For this force-controlled beam with unchanged geometry, nominal bending stress is unchanged. A displacement limit and a yield limit are different design constraints.',
  },
  {
    id: 'yield',
    title: 'Yield Strength',
    body: 'Yield strength alters the safety factor but does not change elastic stiffness. A safety factor greater than one indicates margin, not certification or guaranteed safety.',
  },
  {
    id: 'comparison',
    title: 'Material Comparison',
    body: 'Identical geometry gives different masses and displacements for different materials. An equal-mass or equal-stiffness comparison needs different dimensions. Define the design target and consider strength, fatigue, manufacturing and cost before calling one material better.',
  },
  {
    id: 'fatigue',
    title: 'Fatigue Loading',
    body: 'Repeated loads can initiate fatigue cracks even when nominal stress stays below yield. Load history, mean stress, surface condition, environment and clamp stress concentrations matter. A static yield safety factor cannot predict cycles to failure.',
  },
  {
    id: 'fea-fmea',
    title: 'FEA and FMEA',
    body: 'Finite element analysis (FEA) approximates physical response by solving equations on a mesh. Failure mode and effects analysis (FMEA) organizes how a design can fail and how to prevent or detect it. This lab uses analytical beam theory. A perfectly fixed clamp can predict less motion than a real joint that flexes or slips; a detailed plot does not repair a wrong assumption.',
  },
] as const;

export const glossary = [
  { symbol: 'F', meaning: 'Applied transverse tip force magnitude', unit: 'N' },
  { symbol: 'L', meaning: 'Exposed length from clamp to free end', unit: 'm' },
  { symbol: 'Do', meaning: 'Outer Diameter', unit: 'm' },
  { symbol: 'Di', meaning: 'Inner Diameter', unit: 'm' },
  { symbol: 't', meaning: 'Tube wall thickness', unit: 'm' },
  { symbol: 'A', meaning: 'Cross-sectional area', unit: 'm²' },
  { symbol: 'I', meaning: 'Second moment of area about the neutral bending axis', unit: 'm⁴' },
  { symbol: 'c', meaning: 'Distance from neutral axis to outer fibre', unit: 'm' },
  { symbol: 'E', meaning: "Young's Modulus", unit: 'Pa' },
  { symbol: 'm', meaning: 'Represented exposed-tube mass', unit: 'kg' },
  { symbol: 'ρ (rho)', meaning: 'Density', unit: 'kg/m³' },
  { symbol: 'Mmax', meaning: 'Maximum bending moment at the clamp', unit: 'N·m' },
  { symbol: 'σmax (sigma)', meaning: 'Maximum outer-fibre bending stress magnitude', unit: 'Pa' },
  { symbol: 'δ (delta)', meaning: 'Downward tip displacement', unit: 'm' },
  { symbol: 'σy', meaning: 'Representative yield strength', unit: 'Pa' },
  {
    symbol: 'n',
    meaning: 'Static yield-based safety factor at nonzero load',
    unit: 'dimensionless',
  },
] as const;
