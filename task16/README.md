# Lightbulbs

## Problem Overview

You have `N` bulbs in a row (`N <= 50`).  
Bulb `N` can always be toggled.  
For `i < N`, bulb `i` can be toggled only if:

- bulb `i+1` is `1`
- bulbs `i+2..N` are all `0`

Given an initial `0/1` string, compute the minimum number of toggles needed to reach all zeros.

## Core Idea / Algorithm

These transition rules match exactly the **binary reflected Gray code** toggle pattern:

- each state is a Gray code word,
- one legal toggle corresponds to moving to adjacent Gray code state.

Therefore, the minimum moves from all-zeros to a given state equals the Gray-code rank of that state. Since moves are reversible, the minimum moves from that state back to all-zeros is the same rank.

So we only need to convert Gray code to its binary index:

- `b1 = g1`
- `bi = b(i-1) XOR gi` for `i > 1`
- resulting binary bits `b1..bN` form the answer value.

This conversion is done in one left-to-right pass.

## Correctness Intuition

- Legal toggles define exactly Gray-adjacent transitions.
- Gray index of a state is the distance along this path from all-zeros.
- Reversing moves preserves count, so required minimum to turn off all bulbs equals that index.
- Gray-to-binary prefix-XOR computes this index exactly.

## Complexity Analysis

- Time: `O(N)`
- Memory: `O(1)`

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
1101
```

## Sample Output 1

```txt
9
```

## Sample Input 2

```txt
1011
```

## Sample Output 2

```txt
13
```

## Sample Input 3

```txt
1001101011
```

## Sample Output 3

```txt
946
```
