# Platforms

## Problem Overview

Each platform is a horizontal segment `[L, R]` that can only be translated left/right.  
Moving by distance `d` costs `|d|`.  
For every ball coordinate `x`, it must **not** lie strictly inside any moved platform.

We must minimize total movement cost for all platforms.

## Core Idea

Platforms are independent (different heights do not couple movement), so:

- solve each platform optimally,
- sum all minimal costs.

For one platform with length `len = R - L`, after shift, left endpoint becomes `X`.
Condition becomes: no ball lies in `(X, X + len)`.

Let `next(X)` be the first ball strictly greater than `X`.
Then feasibility is:

`next(X) - X >= len` (or `next(X)` does not exist).

With sorted unique balls `b0 < b1 < ... < b(m-1)`, this creates feasible intervals:

- `(-inf, b0 - len]`
- `[b(i-1), bi - len]` for `i = 1..m-1` (possibly empty)
- `[b(m-1), +inf)`

So for each platform we need the nearest point to `L` in this union.

- The current interval is found via `upper_bound`.
- If `L` is feasible there, cost is `0`.
- Otherwise, best left/right feasible points are taken from:
  - current interval boundary,
  - nearest previous/next non-empty interval,
  - extreme intervals before first / after last ball.

To find nearest previous/next non-empty interval fast, we use a segment tree on
adjacent ball gaps `bi - b(i-1)` and search for first/last gap at least `len`.
This yields `O(log M)` per platform.

## Correctness Intuition

- `X` is feasible iff the first ball to the right of `X` is at least `len` away.
- This is equivalent to the interval decomposition above, which is exact.
- The global feasible set is an ordered union of disjoint intervals, so the nearest
  feasible position to `L` is one of:
  - `L` itself (if feasible),
  - the nearest feasible boundary on the left,
  - the nearest feasible boundary on the right.
- Segment-tree predecessor/successor gap queries find those boundaries correctly.
- Summing independent optimal platform costs yields the global optimum.

## Complexity

- Sorting/deduplicating balls: `O(M log M)`
- Per platform query: `O(log M)`
- Total: `O(M log M + N log M)`
- Memory: `O(M)`

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
3 5
5 9
2 7
3 5
1 10 8 4 5
```

Output:

```text
12
```
