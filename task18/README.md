# Anagrams

## Problem Overview

Given `N` lowercase words, two words are equivalent if one is an anagram of the other (same multiset of letters).  
Find the size of the largest equivalence class.

## Core Idea / Algorithm

For each word:

1. Sort its characters.
2. Use this sorted string as its canonical signature.
3. Count signature frequencies in a hash map.

The maximum frequency over all signatures is the answer.

## Correctness Intuition

Two words are anagrams iff their sorted-character forms are identical.  
So each equivalence class corresponds exactly to one signature key in the map.  
Therefore the largest class size is exactly the largest frequency among keys.

## Complexity Analysis

Let total letters across all words be `L`.

- Sorting each word of length `k`: `O(k log k)`
- Overall: `O(sum(k log k))`, well within constraints (`L <= 1e5`)
- Hash map operations: expected `O(N)`
- Memory: `O(L)` for stored signatures

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
6
cats
caller
dogs
cellar
parrots
recall
```

## Sample Output 1

```txt
3
```

## Sample Input 2

```txt
8
disease
burned
viewer
praised
despair
burden
diapers
review
```

## Sample Output 2

```txt
3
```
