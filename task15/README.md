# Circular Subarrays

## Problem Overview

Given a circular array and a length `K`, modify elements (increment/decrement cost `1` per unit) so that **all circular subarrays of length `K` have equal sum**. Compute the minimum total cost.

## Core Idea / Algorithm

Let `S_i` be the sum of the length-`K` window starting at `i` (mod `N`).
Required: `S_i = S_{i+1}` for all `i`.

Then:

- `S_{i+1} - S_i = a[(i+K) mod N] - a[i] = 0`
- so we must have `a[i] = a[(i+K) mod N]` for all `i`.

Thus indices are partitioned into cycles by repeatedly adding `K` modulo `N`:

- number of cycles = `gcd(N, K)`
- each cycle’s elements must become equal.

For one cycle, minimizing sum of absolute changes is achieved by converting all values to the **median**.  
Total minimum cost is the sum over all cycles.

## Correctness Intuition

- Equal adjacent window sums are equivalent to `a[i] = a[i+K]` for every index.
- This exactly enforces equality inside each `+K` modular cycle.
- Different cycles are independent constraints, so costs add.
- Median minimizes `L1` distance on each cycle, giving optimal total cost.

## Complexity Analysis

- Visit all elements once via cycles: `O(N)`
- Sorting values inside cycles: overall `O(N log N)` in worst case
- Memory: `O(N)`

Fits `N <= 1e5`.

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
10 1
1 2 3 4 5 6 7 8 9 10
```

## Sample Output 1

```txt
25
```

## Sample Input 2

```txt
10 2
1 6 2 7 3 8 4 9 5 10
```

## Sample Output 2

```txt
12
```

## Sample Input 3

```txt
9 3
1 4 7 2 5 8 3 6 9
```

## Sample Output 3

```txt
6
```

## Sample Input 4

```txt
10 10
1 2 3 4 5 6 7 8 9 10
```

## Sample Output 4

```txt
0
```
