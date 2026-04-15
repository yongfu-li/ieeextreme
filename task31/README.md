# Farey Sequence

## Problem Overview

For a given order `N`, consider all reduced fractions `P/Q` such that:

- `0 < P/Q < 1`
- `1 <= Q <= N`
- `gcd(P, Q) = 1`

sorted increasingly.

Given `N` and index `K` (1-based), output the `K`-th fraction.

## Core Idea

Direct generation up to `K` is too slow in worst case (`K` is quadratic in `N`).
We use value-space binary search plus a counting subroutine.

### 1) Counting subroutine

For a rational threshold `p/q`, compute how many reduced fractions `a/b <= p/q` with `b <= N`.

For fixed denominator `b`:

- raw count of numerators `a` with `a/b <= p/q` is `floor(p*b/q)`.
- this includes non-coprime numerators.

Let `C[b]` be the count of reduced fractions with denominator exactly `b`.
Then:

- `C[b] = floor(p*b/q) - sum(C[d])` over proper divisors `d` of `b`.

Compute all `C[b]` in sieve style:

- initialize `C[b] = floor(p*b/q)`
- for `d = 1..N`, subtract `C[d]` from all multiples `2d, 3d, ...`

This is `O(N log N)`.

### 2) Binary search on `X/N`

Find the smallest integer `X` (`1 <= X <= N-1`) such that:

- `count_leq(X/N) >= K`

Let:

- `prev = count_leq((X-1)/N)`
- target rank inside bucket `( (X-1)/N , X/N ]` is `K - prev`.

### 3) Enumerate the bucket

For each denominator `b`, candidate numerator is:

- `a = floor(X*b/N)`

Keep `(a,b)` if:

- `1 <= a < b`
- `a/b > (X-1)/N`
- `gcd(a,b) = 1`

In this interval of width `1/N`, each denominator contributes at most one fraction.
Sort candidates by value and pick the required order statistic.

## Correctness Intuition

- `count_leq` is exact because sieve subtraction removes all non-reduced fractions grouped by reduced denominator divisors.
- Binary search finds the unique width-`1/N` interval containing the `K`-th fraction.
- Enumerating and sorting all reduced fractions in that interval recovers the exact `K`-th value.

## Complexity

- `count_leq`: `O(N log N)`
- binary search calls: `O(log N)`
- interval enumeration: `O(N)`
- sorting interval candidates: `O(N log N)` worst case

Overall: `O(N log^2 N)` time, `O(N)` memory.

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt
```

## Samples

Input:

```text
3 2
```

Output:

```text
1 2
```

Input:

```text
5 4
```

Output:

```text
2 5
```
