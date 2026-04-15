# Number Elimination

## Problem Overview

Given an array, each operation chooses two alive indices and removes the weaker one:

- smaller value is removed;
- on equal values, smaller index is removed.

Operation cost is the larger value of the chosen pair. We need the number of operation sequences that achieve minimum total cost, modulo `1e9+7`.

## Core Idea

Sort by `(value, index)`. Let equal-value run sizes in this sorted order be:

`r1, r2, ..., rk` with prefix sums `S_j = r1 + ... + rj`.

The number of optimal sequences is:

`answer = (Π H(rj)) * (Π C(S_j, rj - 1), for j = 2..k)`

where:

- `H(t) = Π C(x, 2), x = 2..t`
- `C(n, m)` is binomial coefficient modulo `1e9+7`

This formula is computed in `O(N log N)`:

1. sort values (`O(N log N)`),
2. scan runs,
3. multiply the two factors above with precomputed factorials and inverse factorials.

## Correctness Intuition

- In any minimum-cost process, each eliminated element must be removed using the smallest possible winner value that can beat it (in sorted `(value, index)` order).
- This transforms counting into a combinatorial counting over equal-value runs.
- `H(r)` counts optimal eliminations internal to one equal-value run.
- `C(S_j, rj - 1)` counts ways to interleave the necessary eliminations of run `j` with already processed weaker elements.
- Multiplying all independent contributions gives total optimal sequence count.

## Complexity

- Time: `O(N log N)` (sorting dominates)
- Memory: `O(N)` (factorials + array)

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
6
3 1 8 1 5 8
```

Output:

```text
6
```
