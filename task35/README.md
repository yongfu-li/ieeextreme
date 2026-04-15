# Sorting Partition

## Problem Overview

Split the array into contiguous subarrays, sort each subarray independently, and require the whole array to become globally sorted.

Find the **maximum** number of subarrays in such a valid partition.

## Core Idea

Let:

- `A` = original array
- `B` = sorted copy of `A`

At position `i`, a cut after `i` is valid iff multisets of prefixes are equal:

- `multiset(A[0..i]) == multiset(B[0..i])`

Why: then elements needed for first `i+1` sorted positions are already fully contained in first `i+1` original positions, so earlier chunks can be sorted independently.

Track this with a frequency-difference map:

- add `+1` for `A[i]`
- add `-1` for `B[i]`

If all differences are zero (`non_zero_keys == 0`), we can cut here.

Counting all such cut positions gives the maximum number of chunks.

## Correctness Intuition

- Every valid chunk boundary must satisfy prefix multiset equality.
- Whenever equality holds, making a cut is always safe and never hurts future cuts.
- Therefore greedily cutting at every equality point is optimal.

## Complexity

- sorting copy: `O(N log N)`
- single pass with hashmap updates: `O(N)` average

Total: `O(N log N)` time, `O(N)` memory.

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
7
3 1 2 4 100 7 9
```

Output:

```text
3
```

Input:

```text
7
2 1 2 3 3 4 3
```

Output:

```text
5
```
