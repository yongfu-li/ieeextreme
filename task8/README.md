# Swap Permutation

## Problem Overview

Start from the identity permutation `1..N`. We are given `M` swaps (in order), and we must remove exactly one swap so that element `1` ends at position `K` after applying the remaining swaps. If multiple indices work, output the smallest one.

## Core Idea / Algorithm

Track only the position of element `1`.

1. Compute `prefix_position[i]`: position of element `1` after the first `i` swaps.
2. Process candidate removed index `i` from `M` down to `1`.
3. Maintain `suffix_map[x]`: final position after applying swaps `(i+1..M)` to a start position `x`.
   - Initially (empty suffix), `suffix_map[x] = x`.
4. For each `i`:
   - If we remove swap `i`, start position after prefix is `prefix_position[i-1]`.
   - Final position becomes `suffix_map[prefix_position[i-1]]`.
   - If this equals `K`, record `i` as a valid answer.
5. Update `suffix_map` to include swap `i` at the front. This is just:
   - `swap(suffix_map[a_i], suffix_map[b_i])`.

Because we scan downward, the last recorded valid index is the smallest.

## Correctness Intuition

- `prefix_position[i-1]` exactly captures the state before removed swap `i`.
- `suffix_map` exactly captures how the remaining suffix moves any current position.
- Therefore `suffix_map[prefix_position[i-1]]` is exactly where element `1` ends when swap `i` is removed.
- Testing all `i` finds all valid removals, and choosing the smallest satisfies output requirements.

## Complexity Analysis

- Prefix simulation: `O(M)`
- Backward scan + map updates: `O(M)`
- Initial map setup: `O(N)`
- Total: `O(N + M)` time
- Memory: `O(N + M)`

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt > output.txt
```

## Sample Input

```txt
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

## Sample Output

```txt
3
```
