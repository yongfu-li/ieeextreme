# Decreasing Subarrays

## Problem Overview

For each index `i` in array `A`, find the length of the longest **strictly decreasing contiguous subarray** that contains `A[i]`.

## Core Idea / Algorithm

Compute two helper arrays:

- `dec_left[i]`: length of longest strictly decreasing subarray ending at `i`.
  - if `A[i-1] > A[i]`, then `dec_left[i] = dec_left[i-1] + 1`, else `1`.
- `dec_right[i]`: length of longest strictly decreasing subarray starting at `i`.
  - if `A[i] > A[i+1]`, then `dec_right[i] = dec_right[i+1] + 1`, else `1`.

Then the best decreasing subarray containing `i` is:

- `answer[i] = dec_left[i] + dec_right[i] - 1`

(`-1` because `A[i]` is counted in both arrays).

## Correctness Intuition

- Any strictly decreasing subarray containing `i` can be split into:
  - a decreasing suffix ending at `i`,
  - and a decreasing prefix starting at `i`.
- `dec_left[i]` and `dec_right[i]` are maximal for these two parts.
- Combining both maximal parts gives the maximal full subarray through `i`.

## Complexity Analysis

- Time: `O(N)`
- Memory: `O(N)`

Fits `N <= 1e5`.

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
5
3 2 1 1 4
```

## Sample Output 1

```txt
3 3 3 1 1
```

## Sample Input 2

```txt
5
1 2 3 2 1
```

## Sample Output 2

```txt
1 1 3 3 3
```
