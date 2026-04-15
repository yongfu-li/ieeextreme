# Word Ordering

## Problem Overview

Sort `N` strings lexicographically, but using:

- a custom order of letters (given permutation of `'a'..'z'`),
- the rule that **all uppercase letters are lexicographically greater than all lowercase letters**.

The same custom letter permutation is used for uppercase letters as well.

## Core Idea

Build a rank for each character:

- `rank(lowercase c) = pos_in_permutation(c)`
- `rank(uppercase C) = pos_in_permutation(lowercase(C)) + 26`

Then sort strings with standard lexicographic comparison under this rank:

1. compare first differing character ranks,
2. if one string is a prefix of the other, shorter string is smaller.

## Correctness Intuition

- Character ranking exactly matches statement constraints.
- Lexicographic comparison over these ranks is therefore the required custom dictionary order.

## Complexity

Let `L` be the sum of string lengths.

- Sorting cost: `O(L log N)` comparisons in aggregate character work (standard lexicographic behavior).
- Memory: `O(L)` for storing strings.

Given constraints (`N <= 1e5`, total length `<= 1e5`), this is efficient.

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
xyzabcopqrstuvwdefghijklmn
7
pokemons
zebra
anagram
yahoo
pokemon
lake
csacademy
```

Output:

```text
yahoo
zebra
anagram
csacademy
pokemon
pokemons
lake
```
