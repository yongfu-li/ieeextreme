# Tree Swapping

## Problem Overview

We have a tree where each node is red (`R`) or blue (`B`).  
One operation picks an edge and swaps the colors of its endpoints.

Goal: make every edge connect nodes of different colors (a proper 2-coloring), with minimum operations, or report `-1` if impossible.

## Core Idea / Algorithm

A tree has exactly two valid final colorings:

1. partition `0` is red, partition `1` is blue;
2. partition `0` is blue, partition `1` is red.

So we evaluate both targets and take the minimum feasible one.

For one fixed target:

- Let `initial_red[v]` be `1` if node `v` is initially red, else `0`.
- Let `target_red[v]` be `1` if node `v` must be red in this target, else `0`.
- Define node difference `d[v] = initial_red[v] - target_red[v]`.

Root the tree at any node (we use node `1`). For each edge `(parent, child)`, the subtree sum:

`balance[child] = sum(d[x]) over x in child subtree`

is exactly how many red tokens must cross that edge (absolute value), because swaps on that edge are the only way to move color mass across the cut.

Therefore, minimum operations for this target is:

`sum over edges abs(balance[child])`

This is computed in one postorder traversal.

If total initial reds does not match total target reds, that target is impossible.

## Correctness Intuition

- Each swap on edge `(u, v)` moves one red token across that edge (or none if equal colors).
- For a subtree cut induced by edge `(parent, child)`, the subtree must end with exactly `target` red count, so at least `abs(balance[child])` crossings are necessary.
- These lower bounds over edges are independent and additive on trees.
- A flow interpretation on trees shows these crossings are sufficient: route surplus/deficit along unique paths, and realize each unit by one adjacent swap.
- Hence `sum abs(balance[child])` is both a lower bound and achievable, so it is optimal.
- Taking min over the two bipartite targets gives the global optimum.

## Complexity Analysis

- Build bipartition: `O(N)`
- Evaluate one target with iterative DFS postorder: `O(N)`
- Evaluate two targets: `O(N)`
- Memory: `O(N)`

## Build Command

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run Command

```bash
./main < input.txt
```

## Sample Input / Output

Input:

```text
13
BRRBBRBRRBBRR
7 6
6 13
13 8
7 3
3 9
9 11
11 4
6 1
1 2
2 10
13 12
12 5
```

Output:

```text
9
```
