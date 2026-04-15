# Catch the Thief

## Problem Overview

You inspect one node per day. The thief moves every night to a neighbor.  
Initially, the thief may be in any node.

We need a finite sequence of inspected nodes that guarantees capture regardless of the initial node and movement choices.

## Core Idea / Algorithm

Maintain the classical possible-position set transition:

- after inspecting `X`, remove `X` from possible thief positions,
- then move all remaining possibilities through one graph edge.

From the editorial characterization used here:

1. Graphs with cycles are impossible (`-1`).
2. We process each connected component independently (must be trees).
3. For each tree, we:
   - compute a diameter path,
   - require all nodes to be at distance at most `2` from that path (editorial structural condition),
   - 2-color the tree (bipartite),
   - build a left-to-right sweep on red diameter nodes by alternating
     branch checks and returning to the diameter node,
   - repeat the sweep to handle unknown initial parity.

Final strategy is concatenation of component strategies.

## Correctness Intuition

- Cycle components keep re-populating possible sets, so no guaranteed capture.
- Tree + bounded-distance-to-diameter structure allows progressive clearing while preserving control of parity classes.
- Repeating the parity-targeted sweep handles both starting color classes.

## Complexity Analysis

- Connected components + bipartite coloring + BFS diameter per component:
  - `O(N + M)` total
- Distance-to-path validation:
  - `O(N + M)` total
- Strategy construction:
  - `O(N + M)`

Overall: `O(N + M)` time, `O(N + M)` memory.

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt > output.txt
```

## Sample Notes

For the provided samples:

- sample 1: a valid strategy is produced
- sample 2: a valid strategy is produced
- sample 3: `-1`
