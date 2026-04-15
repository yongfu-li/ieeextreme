# Unfair Game

## Problem Overview

There are `N` integers.

- Alex moves first and removes any non-empty subset, adding those numbers to his sum.
- Ben then removes exactly one remaining number.
- Repeat until empty.

Alex maximizes his final sum; Ben minimizes it.

## Key Observation

Sort numbers in non-increasing order:

- `v1 >= v2 >= ... >= vN`

At any Alex turn with remaining suffix `vi..vN`, there is an optimal move where Alex takes a **contiguous prefix**:

- `vi, vi+1, ..., vj` for some `j >= i`

Then Ben removes exactly one number, and to minimize Alex, he removes the largest remaining one, i.e. `v(j+1)` if it exists.

So game transitions become deterministic after choosing `j`:

- Alex gains `sum(vi..vj)`
- next state starts at `j+2`

## DP

Let:

- `f[i]` = best achievable Alex sum from suffix starting at index `i` (Alex to move)
- prefix sums `P[k] = v1 + ... + vk`

Transition:

```text
f[i] = max over j in [i..N] of (P[j] - P[i-1] + f[j+2])
```

Rearrange:

```text
f[i] = (max over j>=i of (P[j] + f[j+2])) - P[i-1]
```

Maintain suffix maximum of `g[j] = P[j] + f[j+2]` while iterating `i` from `N` down to `1`, giving linear DP after sorting.

## Complexity

- sorting: `O(N log N)`
- DP: `O(N)`
- memory: `O(N)`

Total: `O(N log N)`.

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
5
-1 2 10 -10 3
```

Output:

```text
14
```

Input:

```text
5
-5 2 -10 4 -7
```

Output:

```text
-1
```
