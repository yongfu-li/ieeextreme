# Word Ordering

## Problem Overview

Given a custom permutation of lowercase English letters and `N` strings (containing lowercase and uppercase letters), sort the strings lexicographically using that custom alphabet order. For the same letter, uppercase is considered greater than lowercase.

## Core Idea / Algorithm

1. Build a rank array `rank[26]` from the permutation (`rank[c] = position in permutation`).
2. Sort all strings with a custom comparator:
   - Compare characters left to right.
   - If case differs, lowercase comes first (uppercase is always greater).
   - If case is the same, compare by custom rank of the underlying letter.
   - If one string is a prefix of the other, the shorter string comes first.

## Correctness Intuition

The comparator directly implements the exact lexicographic rules from the statement for each position:

- primary key: custom alphabet order of the underlying letter,
- primary key before rank: lowercase before uppercase,
- tie-breaker: shorter prefix-first rule.

Therefore, sorting with this comparator yields the required global order.

## Complexity Analysis

- Building rank map: `O(26)`.
- Sorting: `O(N log N * L)` where `L` is average compared prefix length.
- Memory: `O(total input length)` to store strings.

Given total string length `<= 1e5`, this is efficient.

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt > output.txt
```

## Sample Input

```txt
abcdefghijklmnopqrstuvwxyz
6
ab
aB
aa
aA
B
b
```

## Sample Output

```txt
aa
aA
ab
aB
b
B
```
