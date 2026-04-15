# Greatest Common Divisor

## Problem Overview

Given two positive integers `A` and `B`, compute the largest integer that divides both numbers.

## Core Idea / Algorithm

Use the Euclidean algorithm via `std::gcd(A, B)`:

- Repeatedly reduce the pair until one value becomes `0`.
- The remaining non-zero value is the greatest common divisor.

## Correctness Intuition

The Euclidean algorithm preserves the set of common divisors at each reduction step (`gcd(a, b) = gcd(b, a % b)`), so when it terminates, the remaining value is exactly the largest common divisor.

## Complexity Analysis

- Time: `O(log(min(A, B)))`
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
24 18
```

## Sample Output

```txt
6
```
