# Matrix Exploration

## Problem Overview

Given an `N x M` grid with empty cells (`.`) and blocked cells (`#`), and `K` special empty cells, compute for every empty cell the shortest 4-directional distance to any special cell. Output the sum of these distances over all empty cells.

## Core Idea / Algorithm

Use **multi-source BFS**:

- Initialize a queue with all special cells, each with distance `0`.
- Run BFS simultaneously from all these sources.
- For each reachable empty cell, the first time it is visited gives the shortest distance to the nearest special cell.
- Sum all distances for empty cells at the end.

Blocked cells are never visited.

## Correctness Intuition

In an unweighted grid graph, BFS explores nodes in nondecreasing distance from the source. With multiple sources inserted initially at distance `0`, BFS effectively computes the shortest distance from each cell to the *closest* special cell. Therefore, the computed distance for each empty cell is correct, and summing them yields the required output.

## Complexity Analysis

- Time: `O(N * M)` because each cell is processed at most once.
- Memory: `O(N * M)` for distance storage and queue in the worst case.

This fits the limits (`N, M <= 1000`).

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
3 3 1
...
.#.
...
1 1
```

## Sample Output

```txt
16
```
