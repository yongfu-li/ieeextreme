# Two Progressions

## Problem Overview

Given a non-decreasing array, determine whether it can be obtained by merging two arithmetic progressions (both with positive ratio and length at least `2`), preserving multiplicities.  
Output one valid progression triplet `(first, ratio, length)`, choosing lexicographically by:

1. smaller `first`
2. smaller `ratio`
3. smaller `length`

or `-1` if impossible.

## Core Idea / Algorithm

The reported progression to output always starts with the global minimum value (`first`), because any valid merge contains that value as the first term of one progression.

For candidate ratios, we:

1. Generate a focused set of ratio candidates from early values (and from inferred complements).
2. For each ratio `d`, remove terms of progression:
   - `first, first + d, first + 2d, ...`
3. After removing exactly `length` terms, check if the remaining multiset is a single arithmetic progression:
   - no remaining value appears twice,
   - at least two elements remain,
   - remaining unique values have constant consecutive gap.

To support fast repeated checks while extending `length`, we maintain:

- counts per value,
- ordered active values (`set`),
- multiset of adjacent differences among active values,
- number of values currently with frequency `2`.

This allows each removal and AP-validity query in `O(log N)`.

## Correctness Intuition

- A valid answer progression must start at the minimum value.
- For a fixed ratio, extending by one term corresponds exactly to assigning one more required term to that progression.
- The remainder is valid iff it is exactly one arithmetic progression multiset.
- We try candidate ratios in increasing order and, for each, lengths in increasing order, therefore the first valid triplet is lexicographically minimal for this strategy.

## Complexity Analysis

Per test case:

- Candidate generation: small prefix-based combinations
- Each ratio check: up to `O(N log N)` in worst case
- Practical behavior is efficient under the provided total input limits (`sum N <= 1e5`).

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
5
6
1 2 3 4 5 6
5
0 3 6 8 10
6
0 3 6 8 9 10
6
1 1 2 2 3 3
5
2 4 11 12 30
```

## Sample Output

```txt
1 1 2
0 3 2
0 3 3
1 1 3
-1
```
