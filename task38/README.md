# Colored Marbles

## Problem Overview

For each selected marble, Alex reports the size of that marble's color group in the bag, but exactly one report is a lie.  
For each test case, find the minimum possible total number of marbles in the bag.

## Core Idea

Let `f[x]` be how many times value `x` was reported.

If all reports with value `x` were truthful, the minimum marbles contributed by colors of size `x` is:

- `ceil(f[x] / x) * x`

because one color of size `x` can explain at most `x` selected marbles.

So the baseline (no lie correction yet) is:

- `base = sum_x ceil(f[x] / x) * x`

Now enforce **exactly one lie**:

- choose a reported value `l` to be the lie (remove one from `f[l]`)
- choose a true value `t != l` for that marble (add one to `f[t]`)

The total change is independent between remove/add sides:

- Remove gain for `l` is `l` iff `f[l] % l == 1`, else `0`
- Add cost for `t` is `0` iff `f[t] % t != 0`, else `t`

To minimize add cost:

- if there exists any `t != l` with `f[t] % t != 0`, add cost is `0`
- otherwise use a new value: cost is `1` (or `2` if `l == 1`, since `t != l`)

Try every distinct reported `l` and take the minimum:

- `answer = min_l(base - remove_gain(l) + best_add_cost_excluding_l)`

## Correctness Intuition

- `ceil(f[x] / x) * x` is the minimum truthful marbles required for each reported size `x`.
- One lie means exactly one report moves from one bucket (`l`) to another (`t != l`).
- Since each bucket cost depends only on its own frequency, optimal correction is:
  - maximize reduction on removed bucket,
  - minimize increase on added bucket.
- Enumerating all possible lie buckets `l` and taking the minimum yields the global optimum.

## Complexity

Per test case:

- Building frequencies: `O(N)`
- Evaluating all distinct values: `O(K)` where `K` is number of distinct reports (`K <= N`)

Total over file: `O(sum N)` (fits `<= 1e5`).

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
2
4
2 2 2 2
5
2 2 2 3 3
```

Output:

```text
5
5
```
