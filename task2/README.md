# Addition

## Problem Overview

Given two integers `A` and `B`, output their sum.

## Core Idea / Algorithm

Read the two integers from standard input and print `A + B`.

## Correctness Intuition

The required result is exactly the arithmetic sum of the two input values, so directly computing and outputting `A + B` satisfies the specification.

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

## Sample Input

```txt
3 5
```

## Sample Output

```txt
8
```
