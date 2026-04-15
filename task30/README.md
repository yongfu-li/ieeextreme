# Tree Game

## Problem Overview

Alex chooses an independent set of tree nodes (no two adjacent).
Ben then removes a minimum number of nodes (none from Alex's set) so that no two Alex nodes remain connected.

Alex wants to maximize how many nodes Ben is forced to remove.

## Core Idea

Root the tree (any root, here node `1`) and do DP bottom-up.

For each node `x`:

- `dp[x][0]`: best value in subtree of `x` with **no exposed Alex node** towards parent.
- `dp[x][1]`: best value with **exactly one exposed Alex node**, and it is **not `x`**.
- `dp[x][2]`: best value with **exactly one exposed Alex node**, and it **is `x`**.

Here "exposed" means the Alex node has an unblocked path to the parent side.

For a child `c`, define:

- `dp3(c) = max(dp[c][1], dp[c][2])`

Then transitions:

1. `dp[x][0]`:
   - Ben does not pick `x`: `sum dp[c][0]`
   - Ben picks `x`: choose at least two children contributing `dp3`, others `dp0`, then add `+1` for choosing `x`

2. `dp[x][1]`:
   - exactly one child contributes exposed (`dp3`), all others are `dp0`

3. `dp[x][2]`:
   - `x` is chosen by Alex, so children cannot be chosen by Alex.
   - for each child, either keep it closed with `dp0`, or if child has one exposed non-child Alex node (`dp1`), Ben can cut at child (`dp1 + 1`).
   - sum independently across children.

Leaf base case:

- `dp[leaf][0] = 0`
- `dp[leaf][1] = -INF`
- `dp[leaf][2] = 0`

Final answer is `max(dp[root][0], dp[root][1], dp[root][2])`.

## Why This Works

The DP state captures exactly what matters for parent interaction: how many exposed Alex nodes leave the subtree and whether that node is the current root.
Ben's greedy minimum-cut behavior in a subtree depends only on those exposures, so local optimal transitions combine correctly.

## Complexity

- Building rooted order: `O(N)`
- DP transitions over all children once: `O(N)` total
- Memory: `O(N)`

Fits `N <= 100000`.

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt
```

## Samples

Input 1:

```text
6
1 2
2 3
3 4
4 5
5 6
```

Output 1:

```text
2
```

Input 2:

```text
13
1 2
2 3
1 4
4 5
5 6
6 7
7 8
8 9
8 10
2 11
11 12
11 13
```

Output 2:

```text
5
```
