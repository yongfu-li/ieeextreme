# Swap Permutation

## Problem Overview

Given the identity permutation `1..N` and a sequence of `M` swaps, remove exactly one swap so that element `1` ends at position `K` after applying the remaining swaps.  
If multiple removals work, output the smallest index.

## Core Idea

Let:

- `pref_pos[i]` = position of element `1` after the first `i` swaps.
- `F_{i+1}(x)` = final position of an element currently at `x` after applying swaps `i+1..M`.

If we remove swap `i`, element `1` is at `pref_pos[i-1]` before the suffix, so final position is:

`F_{i+1}(pref_pos[i-1])`.

We compute `pref_pos` in one forward pass.

Then process `i` from `M` down to `1`, maintaining the suffix transform as an array:

- `suffix_map[x] = F_{i+1}(x)` for current `i`.
- Initially suffix is empty, so identity map.
- When we include swap `(a, b)` into the suffix, transform updates as:
  `F_i(x) = F_{i+1}(S_i(x))`, which is exactly swapping `suffix_map[a]` and `suffix_map[b]`.

This gives `O(1)` per swap.

## Correctness Intuition

- `pref_pos[i-1]` is exactly where element `1` stands when swap `i` is skipped.
- `suffix_map` always represents the exact effect of remaining swaps on any current position.
- Therefore `suffix_map[pref_pos[i-1]]` is the exact final position after removing swap `i`.
- Scanning from right to left and overwriting answer ensures the smallest valid index is kept.

## Complexity

- Time: `O(N + M)`
- Memory: `O(N + M)`

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt
```

## Sample

Input:

```text
20 9 7
1 4
4 2
2 3
2 8
3 8
3 7
7 1
1 10
10 7
```

Output:

```text
3
```
