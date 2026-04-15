# City Upgrades

## Problem Overview

Given coordinates of `N` cities on a line, choose exactly `K` cities to upgrade so that the maximum distance from any city to its nearest upgraded city is minimized.

## Core Idea / Algorithm

Binary search the minimum feasible maximum distance `R`.

For a fixed `R`, check feasibility greedily on sorted coordinates:

1. Take the leftmost uncovered city `x[i]`.
2. To maximize coverage, place an upgraded city at the rightmost city with coordinate `<= x[i] + R`.
3. This upgraded city covers all cities up to coordinate `center + R`.
4. Repeat until all cities are covered or `K` upgraded cities are exhausted.

If all cities can be covered with at most `K` upgraded cities, `R` is feasible.

## Correctness Intuition

- For fixed `R`, the best choice for covering the current leftmost uncovered city is the rightmost possible center within distance `R` from it, because that maximizes rightward coverage.
- This greedy step is optimal locally and does not hurt future choices, so it yields the minimum number of centers needed for this `R`.
- Therefore feasibility is correctly decided, and binary search finds the smallest feasible `R`.

## Complexity Analysis

- Sort: `O(N log N)`
- Feasibility check: `O(N)`
- Binary search over distance range: `O(log C)` where `C = max(x) - min(x)`
- Total: `O(N log N + N log C)`
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
3 1
0 3 4
```

## Sample Output 1

```txt
3
```

## Sample Input 2

```txt
5 2
1 2 4 5 10
```

## Sample Output 2

```txt
3
```
