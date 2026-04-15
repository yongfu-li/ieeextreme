# Two Progressions

## Problem Overview

Given a non-decreasing array, determine whether it can be obtained as the multiset merge of two arithmetic progressions:

- strictly positive ratio,
- length at least 2.

If possible, output one progression `(first, ratio, length)` such that:

1. `first` is minimum,
2. then `ratio` minimum,
3. then `length` minimum.

Otherwise output `-1`.

## Core Idea

Let the reported progression start at `first = values[0]` (minimum possible first).

For a fixed candidate `ratio`, we remove terms:

`first, first + ratio, first + 2*ratio, ...`

one by one from the multiset.

After removing `length >= 2` terms, the remainder must be exactly one arithmetic progression (the second one).  
So we need a fast dynamic check: “is current remainder a single AP with positive ratio and at least 2 elements?”

### Remainder AP check data structure

Maintain over remaining values:

- count per distinct value (`0/1/2`),
- ordered set of active distinct values,
- multiset of consecutive gaps in active distinct values,
- number of values with count `2`,
- total remaining size.

Remainder is one valid AP iff:

- `total_count >= 2`
- no duplicate counts (`duplicate_values == 0`)
- and all consecutive gaps are equal (or exactly 2 total elements).

Each single-element removal is `O(log N)`.

## Candidate ratios

We generate a compact candidate set:

1. direct differences from `first` using a short prefix of input,
2. inferred differences by guessing the other progression from pairs in a small prefix and looking at leftovers.

Then test candidate ratios in increasing order; first feasible one is optimal by required tie-breaking. For that ratio, first feasible length is minimal.

## Complexity

For each tested ratio, removals/checks are `O(N log N)` worst-case.  
With bounded candidate set (small constants), this is efficient under constraints (`sum N <= 1e5`).

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
5
6
1 2 3 4 5 6
5
0 3 6 8 10
6
0 3 6 8 9 10
6
1 1 2 2 3 3
5
2 4 11 12 30
```

Output:

```text
1 1 2
0 3 2
0 3 3
1 1 3
-1
```
