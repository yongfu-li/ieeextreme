# Bounding Box

## Problem Overview

Given `N` points with integer coordinates, compute the area of the smallest axis-aligned rectangle that contains all points (inside or on boundary).

## Core Idea / Algorithm

Track:

- minimum and maximum `x`
- minimum and maximum `y`

Then:

- `width = max_x - min_x`
- `height = max_y - min_y`
- `area = width * height`

## Correctness Intuition

Any axis-aligned rectangle containing all points must span at least from smallest to largest `x`, and from smallest to largest `y`.  
Using exactly these extremes gives the unique minimum-width and minimum-height feasible rectangle, hence minimum area.

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
3
1 1
1 3
3 1
```

## Sample Output 1

```txt
4
```

## Sample Input 2

```txt
3
2 3
3 4
4 1
```

## Sample Output 2

```txt
6
```
