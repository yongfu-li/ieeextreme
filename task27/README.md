# Library Book

## Problem Overview

There is one special book.

- Professors must read alone (no one else can read in parallel with a professor).
- Students can read in parallel with other students.
- Everyone reads in one uninterrupted session.

Goal: minimize the time when all readers have finished.

## Core Idea

Sort professors and students by arrival time.

For students, remove dominated entries:

- if a previous student has smaller or equal duration than a later one, the previous one is never critical for the makespan.
- after this compression, student durations are strictly decreasing.

Then use dynamic programming:

- `dp[i][j][0]`: minimum finishing time after placing first `i` professors and first `j` useful students, with the `i`-th professor placed last.
- `dp[i][j][1]`: same, with the `j`-th student placed last.

Transitions:

- professor last:
  - `max(dp[i-1][j][0], prof[i].arrival) + prof[i].duration`
  - `max(dp[i-1][j][1], prof[i].arrival) + prof[i].duration`
- student last:
  - `max(dp[i][j-1][0], stud[j].arrival) + stud[j].duration`
  - `max(dp[i][j-1][1], stud[j].arrival + stud[j].duration)`

The second student-to-student transition works because compressed student durations are decreasing, so overlapping with the previous student remains valid.

## Correctness Intuition

- Professors can be considered in arrival order; when a professor can start, delaying them only postpones exclusive-book time and cannot improve the optimum.
- Students can be considered in arrival order; if an earlier student has duration `<=` a later one, it can always be started together with that later student without worsening the result.
- After compression, each DP state captures all necessary information (how many of each type were placed and which type was placed last).
- Each transition enforces constraints exactly:
  - professors cannot overlap anyone,
  - students cannot overlap professors but may overlap students.
- Therefore, DP computes the optimal feasible schedule.

## Complexity

Let `N` be professors and `M` be students.

- sorting: `O(N log N + M log M)`
- student compression: `O(M)`
- DP: `O(N * M')`, where `M' <= M`

Overall: `O(N * M)` time, `O(N * M)` memory, which fits `N, M <= 3000`.

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
