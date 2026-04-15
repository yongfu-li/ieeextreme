# Sorting Partition

## Problem Overview

Given an array, split it into the maximum number of contiguous subarrays such that sorting each subarray independently makes the whole array globally sorted.

## Core Idea / Algorithm

Let `sorted` be the globally sorted copy of the array.

While scanning index `i` from left to right, maintain frequency differences between:

- elements seen in `original[0..i]`, and
- elements seen in `sorted[0..i]`.

If all frequency differences are zero at position `i`, then the multiset of elements in both prefixes is identical, so we can safely cut a partition after `i`.

Count all such cut points; this count is the maximum number of valid subarrays.

## Correctness Intuition

A cut after index `i` is valid exactly when the left prefix contains exactly the elements that should appear there in sorted order (as a multiset). Then sorting left and right parts independently cannot violate global sortedness.

By cutting at every valid position, we maximize the number of subarrays, because each valid cut is independent and always beneficial.

## Complexity Analysis

- Sorting: `O(N log N)`
- One pass with hash map updates: expected `O(N)`
- Total: `O(N log N)` time
- Memory: `O(N)`

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
7
3 1 2 4 100 7 9
```

## Sample Output 1

```txt
3
```

## Sample Input 2

```txt
7
2 1 2 3 3 4 3
```

## Sample Output 2

```txt
5
```
