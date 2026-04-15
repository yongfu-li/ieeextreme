# A-Game

## Problem Overview

Two players alternate selecting a non-empty substring that does not overlap with previously selected substrings.  
At the end, all characters are selected.  
The winner is the player who selected fewer `A` characters.

Output:

- `A` if Alex wins,
- `B` if Ben wins,
- `-1` for draw.

## Core Idea / Algorithm

Let:

- `cntA` = total number of `A` characters in the string.
- `xorB` = XOR of lengths of maximal consecutive `B` blocks.

Then:

1. If `cntA` is even, optimal play is a draw (`-1`).
2. If `cntA` is odd:
   - Alex wins iff `xorB != 0`,
   - otherwise Ben wins.

So we only need one linear scan:

- count `A`,
- compute XOR over all `B` run lengths.

## Correctness Intuition

- The only scoring characters are `A`; `B` characters are score-neutral.
- For odd `cntA`, one player must end with one extra `A`, so deciding the winner reduces to deciding who gets that extra `A`.
- Neutral `B` moves act as turn-control moves. Their structure is exactly an impartial take-and-split game on each `B` run; the combined winning condition is the nim-sum (`xorB`) of run lengths.
- Therefore:
  - odd `cntA` + non-zero nim-sum -> first player (Alex) controls parity and wins,
  - odd `cntA` + zero nim-sum -> second player (Ben) wins,
  - even `cntA` -> both can force equal `A` counts, so draw.

## Complexity Analysis

- Time: `O(N)`
- Memory: `O(1)` extra

## Build Command

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run Command

```bash
./main < input.txt
```

## Sample Input / Output

Input:

```text
11
ABAABBABBBA
```

Output:

```text
B
```
