# Unfair Game

## Problem Overview

Alex and Ben play on a multiset of `N` integers:

- Alex (first) removes any non-empty subset and adds those values to his score.
- Ben removes exactly one remaining number.

Both play optimally: Alex maximizes his final sum, Ben minimizes it.

## Core Idea / Algorithm

Because the game depends only on values (not positions), sort all numbers in non-increasing order.

If Alex takes a prefix ending at index `j`, then Ben will optimally remove the next largest remaining number (`j + 1`) to hurt Alex the most. So the game transitions to index `j + 2`.

Define:

- `f[i]`: maximum Alex sum from sorted suffix `i..N` when Alex moves.

Transition:

- `f[i] = max over j >= i of (sum(i..j) + f[j+2])`

Using prefix sums:

- `sum(i..j) = pref[j] - pref[i-1]`
- `f[i] = -pref[i-1] + max_{j>=i}(pref[j] + f[j+2])`

Maintain suffix maxima of `pref[j] + f[j+2]` while iterating backward, giving `O(N)` DP after sorting.

## Correctness Intuition

- Alex always chooses a subset of remaining values; for fixed count, choosing largest values is optimal.
- After Alex takes the top `t` remaining values, Ben minimizes Alex’s future score by deleting the largest leftover value.
- Therefore each move is equivalent to selecting a cut `j` in the sorted array and jumping to `j+2`.
- The DP checks all such optimal choices and stores best achievable result for every suffix, so `f[1]` is the game outcome.

## Complexity Analysis

- Sorting: `O(N log N)`
- DP + suffix maxima: `O(N)`
- Total: `O(N log N)`
- Memory: `O(N)`

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt > output.txt
```

## Sample Input 1

```txt
5
-1 2 10 -10 3
```

## Sample Output 1

```txt
14
```

## Sample Input 2

```txt
5
-5 2 -10 4 -7
```

## Sample Output 2

```txt
-1
```
