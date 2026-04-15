# Voting

## Problem Overview

We must output an order of judges' assessments so that the final awarded score is as close as possible to `X`.

If `k` judges already voted and current score is `c`, the next judge with assessment `a` votes:

- `1` if `a > c * N / k` (equivalently `a * k > c * N`)
- `0` otherwise

The first judge always votes `0`.

## Core Idea

Sort assessments as `A1 <= A2 <= ... <= An`.

Consider the permutation sequence obtained by adjacent swaps that always swap an increasing adjacent pair and gradually transforms:

- increasing order -> decreasing order

One concrete construction is:

- repeatedly move the current last element of the remaining suffix to the left (one adjacent swap at a time).

Along this sequence:

- score is non-increasing,
- each step changes score by at most `1`.

Therefore every integer score between:

- `M = score(increasing order)`
- `m = score(decreasing order)`

is achievable.

So:

1. if `X >= M`, use increasing order
2. if `X <= m`, use decreasing order
3. otherwise binary search on step index in this monotone sequence to get score closest to `X`.

## Efficient Step -> Permutation

Let `s` be number of adjacent swaps done in the sequence.

The sequence consists of rounds with lengths:

- `n-1, n-2, ..., 1`

After consuming full rounds, only one partial round remains. The permutation for `s` can be built directly in `O(N)` without simulating swaps.

## Complexity

- sorting: `O(N log N)`
- each score evaluation: `O(N)`
- binary search over `s` in `[0, N(N-1)/2]`: `O(log N^2) = O(log N)` evaluations

Total: `O(N log N)` time, `O(N)` memory.

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt
```

## Sample Runs

Input:

```text
3 1
0 1 2
```

One valid output:

```text
2 1 0
```

Input:

```text
3 3
0 1 2
```

One valid output:

```text
0 1 2
```
