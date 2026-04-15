# Online GCD

## Problem Overview

Given an array and `M` update operations, each update divides one element by a guaranteed divisor. After every update, output the GCD of the whole array.

## Core Idea / Algorithm

Use a **segment tree** where each node stores the GCD of its segment.

- Build tree from initial array.
- For each update `(idx, d)`:
  1. update `a[idx] = a[idx] / d`,
  2. perform point update on the segment tree,
  3. output the root value (GCD of the whole array).

## Correctness Intuition

- Segment-tree invariant: each node stores the GCD of exactly its range.
- Point update only changes one leaf and recomputes GCDs on the path to root, restoring the invariant.
- Root always equals GCD of all `N` elements, so output is correct after each operation.

## Complexity Analysis

- Build: `O(N)`
- Each update: `O(log N)`
- Total: `O(N + M log N)`
- Memory: `O(N)`

Fits `N, M <= 1e5`.

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
3 3
36 24 72
1 3
3 12
2 4
```

## Sample Output 1

```txt
12
6
6
```
