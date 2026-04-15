# Word Permutation

## Problem Overview

Initially, `N` distinct words are sorted lexicographically. Then a permutation `sigma` is applied so that the word at original index `i` moves to position `sigma(i)`.

Given the final (permuted) list, reconstruct and output `sigma`.

## Core Idea / Algorithm

1. Read the given list `permuted_words`.
2. Create `sorted_words = permuted_words` and sort it lexicographically; this is the original order.
3. Map each word to its original 1-based index in `sorted_words`.
4. Scan the given list by current position `pos`:
   - let `idx` be the original index of this word,
   - set `sigma[idx] = pos`.
5. Output `sigma[1..N]`.

## Correctness Intuition

- `sorted_words` is exactly the initial list before permutation.
- Each word is distinct, so each word identifies one unique original index.
- In the permuted list, when a word appears at position `pos`, that means its original index `i` satisfies `sigma(i) = pos`.
- Filling this for all words reconstructs the full permutation uniquely.

## Complexity Analysis

- Sorting: `O(N log N)`
- Hash map build + reconstruction: `O(N)` expected
- Memory: `O(N)` (plus total word storage)

Fits the constraints (`N <= 1e5`, total characters `<= 1e5`).

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
3
xyz
abc
foo
```

## Sample Output 1

```txt
2 3 1
```

## Sample Input 2

```txt
6
cloud
algorithms
complexity
development
python
java
```

## Sample Output 2

```txt
2 1 3 4 6 5
```
