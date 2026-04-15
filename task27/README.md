# Library Book

## Problem Overview

There is one special book.

- Professors must read alone (no one else can read in parallel with a professor).
- Students can read in parallel with other students.
- Everyone reads in one uninterrupted session.

Goal: minimize the time when all readers have finished.

## Core Idea

Assume professors are scheduled in one "professor phase" that starts at time `S`.
For a fixed `S`:

1. Compute the earliest finishing time `E(S)` for all professors (work-conserving simulation with release times).
2. Each student either:
   - finishes before `S` if `arrival + duration <= S`, or
   - must finish after professors: `max(arrival, E(S)) + duration`.
3. The makespan for that `S` is the maximum completion among all professors/students.

We evaluate only candidate values of `S` where the objective can change:

- professor arrivals `r_i` and `r_i - 1`
- student thresholds `(a_j + t_j)` and `(a_j + t_j - 1)`
- `0`

Then take the minimum makespan across candidates.

## Correctness Intuition

- For fixed `S`, professors should be scheduled without intentional idle time whenever a professor is available; this minimizes professor completion time `E(S)`.
- Students do not block each other, so each student can be treated independently:
  - either fully before professor phase,
  - or after professors finish.
- The global completion time for fixed `S` is therefore exactly the max of these independent completion times.
- The makespan function only changes when crossing arrival/threshold boundaries, so checking those boundary candidates is sufficient.

## Complexity

Let `N` be professors and `M` be students.

- Number of candidate start times: `O(N + M)`
- For each candidate:
  - professor simulation: `O(N)`
  - student scan: `O(M)`

Total: `O((N + M)^2)` time, `O(N + M)` memory.

With `N, M <= 3000`, this is efficient enough.

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
1 2
1 3
2 4
3 3
```

Output:

```text
8
```
