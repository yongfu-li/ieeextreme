# Online XorMax

## Problem Overview

We have an array of length `N`.
Before each removal operation, we must output the maximum xor value of a subarray that contains only currently available elements.

Operations remove indices in a given permutation order.

## Core Idea

Process queries offline in reverse:

- forward: remove elements one by one
- reverse: start with all elements unavailable, then add them back in reverse removal order

After each reverse add, we need the maximum xor subarray over all active contiguous segments.

For a segment `[L, R]`, maximum xor subarray equals:

- maximum xor of two values from prefix-xor set `{PX[L-1], PX[L], ..., PX[R]}`

So each active segment stores:

- a binary trie over its prefix-xor values
- the best xor pair inside that segment

When adding a position `pos`:

1. no active neighbors -> create new segment trie with `PX[pos-1]` and `PX[pos]`
2. exactly one active neighbor -> extend that segment and insert one new prefix value
3. both neighbors active -> merge two segments (small-to-large), reinserting values from smaller trie/list into larger trie

Maintain a DSU over active indices to locate and merge adjacent segments.

## Why Small-to-Large

On merge, always move values from the smaller component into the bigger one.
Each prefix value can move only `O(log N)` times, so total reinserts are bounded.

## Complexity

Let `B = 30` bits (`a[i] <= 1e9`).

- trie insert/query: `O(B)`
- total moved values with small-to-large: `O(N log N)`

Total: `O(N log N * B)` time, `O(total trie nodes)` memory.

This fits `N <= 1e5`.

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
10
169 816 709 896 58 490 97 254 99 796
4 2 3 10 5 6 1 8 9 7
```

Output:

```text
1008
992
992
992
490
490
254
254
99
97
```
