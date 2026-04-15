# Colored Marbles

## Problem Overview

For each chosen marble, Alex reports the total number of marbles in the bag that have the same color. Exactly one of these reports is a lie. For each test case, compute the minimum possible total number of marbles in the bag.

## Core Idea / Algorithm

Let `freq[v]` be how many times value `v` is reported.

Pick one reported value `r` to be the lie:

- truthful counts become `freq[r] - 1` for `r`, and unchanged for all other values.
- for any truthful value `v` with count `c`, the minimum marbles needed for colors of size `v` is:
  - `ceil(c / v) * v`
  because one color of size `v` can justify at most `v` truthful picks.

So:

1. Compute base cost using all reports as truthful.
2. For each candidate lie value `r`, adjust only its group from `freq[r]` to `freq[r]-1`.
3. Ensure a liar marble can exist with true color-size `t != r`:
   - if some other size-group has at least one spare marble (`ceil(c/v)*v - c > 0`), no extra marbles are needed.
   - otherwise add one new smallest possible color with size different from `r`:
     - add `1` if `r != 1`, else add `2`.
4. Take the minimum over all candidate `r`.

## Correctness Intuition

- Grouping by reported value is independent per value for truthful statements.
- For each value `v`, `ceil(c/v)` colors is the fewest possible to host `c` truthful chosen marbles, thus minimal marbles for that group.
- Exactly one lie means exactly one reported occurrence is excluded from truthful grouping.
- The liar marble must still come from some actual color whose size differs from the lied value; either existing spare capacity provides it, or one minimal extra color must be added.
- Checking every possible lied value yields the global minimum.

## Complexity Analysis

Per test case:

- Frequency build: `O(N)`
- Evaluate all distinct values: `O(U)` where `U` is number of distinct reported values
- Total: `O(N)` expected (hash map), with `U <= N`
- Memory: `O(U)`

Across all test cases, total `N <= 1e5`, well within limits.

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
2
4
2 2 2 2
5
2 2 2 3 3
```

## Sample Output

```txt
5
5
```
