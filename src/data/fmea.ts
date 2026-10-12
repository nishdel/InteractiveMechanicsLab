export const fmeaItems = [
  {
    id: 'yielding',
    function: 'Support rider weight and dynamic loads',
    failureMode: 'Excessive permanent bending or yielding of the tube',
    effect: 'Permanent change in saddle position or loss of support',
    cause:
      'Excessive bending load, insufficient section size, or lower actual yield strength than assumed',
    prevention:
      'Define load cases, use appropriate verified material allowables, and justify a design margin',
    detection:
      'Compare nominal stress with applicable yield data; inspect permanent set and validate component strength by testing',
    action:
      'Evaluate diameter, wall thickness, exposed length and material condition; validate the revised design and interfaces',
  },
  {
    id: 'fatigue',
    function: 'Withstand repeated cyclic loading over service life',
    failureMode: 'Fatigue crack initiation near clamp interface',
    effect: 'Progressive crack growth, fracture and loss of saddle support',
    cause:
      'Repeated variable loads, mean stress, surface or material defects, and local clamp stress concentrations',
    prevention:
      'Control surface quality and stress concentrations; validate fatigue performance for the intended load history',
    detection:
      'Qualified material-appropriate inspection and fatigue testing; visual inspection alone may miss cracks',
    action:
      'Evaluate smoother transitions, clamp geometry and material/process condition using fatigue-specific validation',
  },
  {
    id: 'crushing',
    function: 'Maintain circular cross-section under clamp load',
    failureMode: 'Local crushing or ovalisation by clamp mechanism',
    effect: 'Reduced load-bearing capacity and altered stress distribution',
    cause: 'Excessive clamp force or inadequate clamp interface geometry',
    prevention: 'Verify compatible tube/clamp geometry and the approved assembly specification',
    detection: 'Visual and dimensional check for ovalisation at clamp points',
    action:
      'Evaluate contact area, wall thickness and tolerances; validate local contact behavior and physical performance',
  },
  {
    id: 'slippage',
    function: 'Maintain fixed position relative to frame',
    failureMode: 'Seatpost slip under dynamic or static load',
    effect: 'Sudden change in saddle height and potential loss of control',
    cause: 'Insufficient friction, wear, or contamination at interface',
    prevention:
      'Use compatible dimensions and manufacturer-approved interface preparation and assembly procedures',
    detection:
      'Check relative movement in a validated retention test and follow the specified inspection procedure',
    action:
      'Review fit, friction assumptions and clamp design; verify retention without causing local crushing',
  },
  {
    id: 'insertion',
    function: 'Transfer loads effectively from saddle to frame',
    failureMode: 'Insufficient insertion depth or poor load transfer',
    effect: 'Local overload or damage to the post/frame and loss of support',
    cause:
      'Insufficient engagement length, poor fit, or an assumed load-transfer path that the assembly cannot provide',
    prevention:
      'Verify both frame and post insertion requirements and compatible load-transfer geometry',
    detection:
      'Check actual engagement against the relevant markings/specification; validate the assembly load path',
    action:
      'Review engagement length and interface geometry; validate the frame/post system for its specified insertion limits',
  },
] as const;
