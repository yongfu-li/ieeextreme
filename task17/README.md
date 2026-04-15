# Next Dance Move

## Problem Overview

The dance sequence repeats forever:

`1, 2, 3, 1, 2, 3, 1, 2, 3, 4`

Given `N` (1-indexed), output the `N`th move.

## Core Idea / Algorithm

The sequence has period `10`.  
So the answer is:

- `pattern[(N - 1) mod 10]`

where `pattern = [1,2,3,1,2,3,1,2,3,4]`.

## Correctness Intuition

Since the exact same 10 moves repeat forever, every position maps to one index inside the base period using modulo. That index gives the unique correct move.

## Complexity Analysis

- Time: `O(1)`
- Memory: `O(1)`

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt > output.txt
```

## Sample Input / Output

Input:

```txt
1
```

Output:

```txt
1
```

Input:

```txt
3
```

Output:

```txt
3
```
