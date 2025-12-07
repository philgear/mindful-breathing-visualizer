# Wolfram Breathing Visualizer

This directory explores mathematical modeling of breathing patterns using the Wolfram Language.

## Usage (Wolfram Script)

1.  If you have the Wolfram Engine installed:
    ```bash
    wolframscript -f breathing.wls
    ```

## Usage (Wolfram Alpha)

You can visualize these patterns directly in Wolfram Alpha or similar computational knowledge engines by using Piecewise function definitions.

**Copy and paste this query into [Wolfram Alpha](https://www.wolframalpha.com/):**

```text
plot piecewise[{{t/4, 0<=t<4}, {1, 4<=t<8}, {1-(t-8)/4, 8<=t<12}, {0, 12<=t<16}}] for t=0 to 16
```

This represents the **Box Breathing** cycle:
- `t/4`: Inhale (0 to 4s)
- `1`: Hold (4 to 8s)
- `1-(t-8)/4`: Exhale (8 to 12s)
- `0`: Hold (12 to 16s)
