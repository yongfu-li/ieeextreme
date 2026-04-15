# Food Pairing

## Problem Overview

You have ingredient stock and `M` dish recipes (each recipe is ingredient units for one portion).  
Each programmer must receive the same **pair of two distinct dishes**.  
Find the maximum number of programmers that can be served.

## Core Idea / Algorithm

Fix a pair of dishes `(a, b)`.

For ingredient `i`, one programmer needs:

- `need_i = recipe[a][i] + recipe[b][i]`

So this pair can serve at most:

- `floor(stock[i] / need_i)` for each `i` with `need_i > 0`

Hence feasible programmers for this pair is:

- `min_i floor(stock[i] / need_i)` over all relevant ingredients.

Evaluate this for every distinct pair `(a, b)` and take the maximum.

## Correctness Intuition

For a fixed pair, ingredient constraints are independent upper bounds on number of served programmers. The tightest ingredient determines the maximum feasible count for that pair.  
Trying all dish pairs guarantees we find the global optimum.

## Complexity Analysis

- Number of dish pairs: `M * (M - 1) / 2`
- Work per pair: `N`
- Total: `O(M^2 * N)`
- Memory: `O(M * N)`

With `M <= 512` and `N <= 32`, this is easily within limits.

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
2
10 10
3
2 3
3 1
1 5
```

## Sample Output 1

```txt
2
```

## Sample Input 2

```txt
3
20 10 15
4
1 2 3
4 1 1
1 3 1
2 1 2
```

## Sample Output 2

```txt
3
```
