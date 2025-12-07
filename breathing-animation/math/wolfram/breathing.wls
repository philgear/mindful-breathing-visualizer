(* Mindful Breathing Visualizer - Wolfram Language Script *)

(* Box Breathing Function *)
(* 4s Inhale, 4s Hold, 4s Exhale, 4s Hold *)
boxBreathing = Piecewise[{
  {t/4, 0 <= t < 4},       (* Inhale: Linear 0 to 1 *)
  {1, 4 <= t < 8},         (* Hold: Constant 1 *)
  {1 - (t-8)/4, 8 <= t < 12}, (* Exhale: Linear 1 to 0 *)
  {0, 12 <= t < 16}        (* Hold: Constant 0 *)
}];

(* Plotting *)
Print["Generating Box Breathing Plot..."];
plot = Plot[boxBreathing, {t, 0, 16},
  PlotLabel -> "Box Breathing Cycle (4-4-4-4)",
  AxesLabel -> {"Time (s)", "Lung Volume"},
  Filling -> Axis,
  PlotStyle -> Thick,
  ColorFunction -> Function[{x, y}, ColorData["SouthwestColors"][y]]
];

(* Export the plot if running in a notebook or environment that supports it *)
(* Export["box_breathing.png", plot]; *)

Print["Plot definition created."];
Print[plot];

(* 4-7-8 Breathing Function *)
breath478 = Piecewise[{
  {t/4, 0 <= t < 4},           (* Inhale 4s *)
  {1, 4 <= t < 11},            (* Hold 7s *)
  {1 - (t-11)/8, 11 <= t < 19}  (* Exhale 8s *)
}];

Print["\nGenerating 4-7-8 Plot..."];
plot478 = Plot[breath478, {t, 0, 19},
  PlotLabel -> "4-7-8 Relaxing Breath",
  AxesLabel -> {"Time (s)", "Lung Volume"},
  Filling -> Axis,
  PlotStyle -> {Thick, Dashed}
];

Print[plot478];
