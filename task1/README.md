# Jarawi and The Interview

## Overview

This repository contains a C++17 solution for the problem:

- Given a source string `s`, answer multiple queries.
- For each query string `p`, compute the length of the longest suffix of `p` that is a subsequence of `s`.

## Key Idea

For each character `'a'` to `'z'`, store all its indices in `s` (sorted naturally by scanning left to right).

For a query `p`:

1. Start from the end of `p` (right to left).
2. Keep a pointer `pos` in `s` (initially `|s|`), meaning we need an index `< pos`.
3. For each character, use `lower_bound` on its positions list to find the rightmost valid occurrence before `pos`.
4. If found, move `pos` to that index and increment matched suffix length.
5. If not found, stop. The current matched count is the answer.

This greedy right-to-left matching gives the maximum suffix length.

## Complexity

- Preprocessing: `O(|s|)`
- Each query: `O(|p| log |s|)`
- Total: `O(|s| + sum(|p_i| log |s|))`
- Memory: `O(|s|)`

Given `|p_i| <= 100`, this is efficient for the constraints.

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt > output.txt
```

## Sample

Input:

```text
abacaba
5
ba
caa
aaaa
xyz
abacaba
```

Output:

```text
2
3
4
0
7
```
