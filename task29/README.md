# Binary Matching

## Problem Overview

Given binary strings `Text` and `Pattern`, we may swap adjacent characters in `Text`.
We need:

1. the maximum possible number of occurrences of `Pattern` as a contiguous substring,
2. among all such maximum configurations, the minimum number of adjacent swaps.

## Core Idea

We build the final text from left to right with dynamic programming.

State:

- `dp[i][z][k]` (rolled by `i`) where:
  - `i`: first `i` positions in final text are fixed,
  - `z`: among those `i` positions, exactly `z` are zeroes,
  - `k`: KMP automaton state (length of longest prefix of `Pattern` matching suffix of built prefix).

Each state stores a pair:

- maximum number of matches so far,
- minimum swaps among ways obtaining that maximum.

Transition by placing next bit (`0` or `1`) if available.
KMP transition gives:

- next automaton state,
- whether this new character closes one full pattern occurrence.

## Swap Cost Computation

For a fixed target arrangement, minimum adjacent swaps are obtained by greedily taking, for each target position, the first untouched matching character from the original text.

So when we place the next `0` (or `1`), we know exactly which occurrence from original text is used:

- `(zero_used + 1)`-th zero, or
- `(one_used + 1)`-th one.

Its original position is known from precomputed index arrays.
Additional swaps equal the number of still-unchosen characters before that position:

- `added_swaps = (origin_pos - 1) - chosen_before_origin`.

`chosen_before_origin` is computed in `O(1)` from:

- how many zeroes/ones were already used,
- prefix counts of zeroes/ones in original text.

## Correctness Intuition

- KMP state `k` is sufficient to determine future match contributions.
- Counts of used zeroes/ones uniquely determine which original occurrences are already consumed, so incremental swap cost is exact.
- Therefore each DP state is fully characterized by `(i, z, k)`.
- Lexicographic optimization (maximize matches first, then minimize swaps) is valid because future potential depends only on the state, not on how we reached it.

## Complexity

Let `N = |Text|`, `M = |Pattern|`.

- DP states per layer: `O(N * M)`
- Layers: `N`
- Transitions are constant-time (2 choices)

Total: `O(N^2 * M)` time, `O(N * M)` memory with rolling layers.

With `N, M <= 500`, this fits comfortably in C++.

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt
```

## Sample 1

Input:

```text
01100
010
```

Output:

```text
2 1
```

## Sample 2

Input:

```text
000111
1100
```

Output:

```text
1 4
```
