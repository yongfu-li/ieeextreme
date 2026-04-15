# Matrix Coloring

## Problem Overview

We need the minimum number of row/column paint operations (each operation paints one full row or one full column in `R`/`B`) to obtain a given fully colored matrix.  
If impossible, output `-1`.

## Core Idea / Algorithm

A cell is painted if its row or its column is operated. Therefore, in any valid solution:

- either **all rows** are operated, or
- **all columns** are operated.

So we solve both cases and take the minimum.

### Case A: all rows are operated

Pick one column as a base; its colors define row colors.

For every other column:

- if it is identical to base column, it can stay unoperated;
- otherwise it must be operated, and all mismatching cells must agree on one color (the column paint color), otherwise this base is invalid.

This gives a candidate operation count:

- `N + (#operated columns)`.

Then we must check ordering feasibility (last-writer rule):

- build precedence graph between row nodes and operated-column nodes;
- add edge according to each constrained cell:
  - row before column or column before row;
- candidate is feasible iff this graph is acyclic (topological sort succeeds).

### Case B: all columns are operated

Symmetric to Case A (swap rows/columns).

## Correctness Intuition

- Coverage requirement forces one whole side (rows or columns) to be fully operated.
- For a fixed base in one case, determined line colors and mismatch consistency exactly capture whether each opposite-side line can be represented with at most one operation.
- Precedence edges encode the required relative order for each constrained cell; acyclicity is equivalent to existence of a valid global operation order.
- Checking all bases in both cases and taking the minimum feasible count yields the optimum.

## Complexity Analysis

Let matrix size be `N x M`.

- Base scanning and candidate generation: `O(N*M*max(N, M))` in worst case.
- Each validated candidate uses `O(N*M)` to build/check constraints.

This implementation is optimized for the problem limits (`N, M <= 3000`) and uses fast I/O plus bitset-style comparisons for line equality.

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
2 8
BBRRRBRB
BBRRRRRB
```

## Sample Output 1

```txt
6
```

## Sample Input 2

```txt
5 10
BRRBBRBBBB
BRRRBRRBRR
RRRRBRRRRR
BRRBBRBBBB
RRRRRRRRRR
```

## Sample Output 2

```txt
11
```

## Sample Input 3

```txt
2 3
RRB
BRR
```

## Sample Output 3

```txt
-1
```
