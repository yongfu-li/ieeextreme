# Platforms

## Problem Overview

There are `N` horizontal platforms, each represented by an interval `[L, R]` on the `x` axis, and `M` ball landing coordinates on the same axis.

A platform can be shifted horizontally by distance `d` with cost `|d|`.  
For every platform, after shifting, no ball coordinate is allowed to be **strictly inside** the interval.

We need the minimum total movement cost over all platforms.

## Core Idea / Algorithm

Each platform is independent, so total answer is the sum of per-platform minimum costs.

For a fixed platform `[L, R]`, shifting by `d` makes it `[L + d, R + d]`.  
A ball at `x` is forbidden iff:

- `L + d < x < R + d`
- equivalently `x - R < d < x - L`

So each ball defines a forbidden open interval for `d`. We need the closest `d = 0` outside the union of these intervals.

Only balls with `L < x < R` directly forbid `d = 0`, but overlapping forbidden intervals can extend this blocked region through chains of nearby balls. Two neighboring balls connect if their gap is `< len`, where `len = R - L` (strict, because forbidden intervals are open).

After sorting balls:

1. Find indices of balls strictly inside `(L, R)`.
2. If none, cost is `0`.
3. Otherwise, expand to the full connected component (by gaps `< len`):
   - left boundary found via nearest previous gap `>= len`
   - right boundary found via nearest next gap `>= len`
4. If component spans balls `x[a..b]`, blocked `d` interval around `0` is:
   - `(x[a] - R, x[b] - L)`
   So minimal cost is:
   - `min(R - x[a], x[b] - L)`

To support fast “nearest gap > len” queries, build a segment tree with max on adjacent ball gaps.

## Correctness Intuition

- The forbidden set for `d` is exactly the union of all `(x-R, x-L)`.
- Around `d=0`, only the connected component containing `0` matters for nearest valid shift.
- In sorted order, forbidden intervals overlap exactly when adjacent ball gap is at most platform length.
- Therefore finding the connected component by “gap > len” barriers gives the exact blocked interval around `0`.
- The nearest valid shift is one of its two boundaries, yielding the minimum movement cost for that platform.
- Summing independent platform minima gives the global optimum.

## Complexity Analysis

- Sort balls: `O(M log M)`
- Build gaps + segment tree: `O(M)`
- Each platform:
  - two binary searches on balls: `O(log M)`
  - two segment-tree threshold queries: `O(log M)`
- Total: `O(M log M + N log M)`
- Memory: `O(M)`

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
3 5
5 9
2 7
3 5
1 10 8 4 5
```

## Sample Output

```txt
12
```
