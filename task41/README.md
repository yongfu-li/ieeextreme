# Number Elimination

## Problem Overview

We repeatedly choose two alive indices:

- the smaller value is eliminated,
- on equal values, the smaller index is eliminated,
- operation cost is the larger value.

We need the number of operation sequences with minimum total cost (mod `1e9+7`).

## Core Idea

Sort values and group equal values.  
Let group sizes in increasing value order be:

`c1, c2, ..., ct`, with `c1 + ... + ct = N`.

### Minimal-cost structure

For an element in group `g`:

- if there is an equal element with larger index, eliminating it by that equal value is cheapest;
- otherwise (the rightmost in that value), it must be eliminated by value from the next larger group.

So optimal eliminations are constrained to:

1. **internal eliminations** inside each equal-value group,
2. **one bridge elimination** from each group `g` to group `g+1` (`g < t`).

### Counting formula

For one group of size `c`, number of internal optimal sequences is:

`f(c) = product_{k=2..c} C(k,2) = c! * (c-1)! / 2^(c-1)`.

When adding group `g` after all smaller groups, interleavings contribute:

`C(prefix_g, c_g - 1)`,

where `prefix_g = c1 + ... + c_g`.

Final answer:

`ans = ( product_{g=1..t} f(c_g) ) * ( product_{g=2..t} C(prefix_g, c_g - 1) ) mod 1e9+7`.

## Correctness Intuition

- Minimal cost forces every non-rightmost equal-value element to die inside its own group.
- The rightmost representative of each value (except global maximum value group) must be killed by the next value group.
- These constraints fully characterize optimal sequences.
- Internal choices for each group are independent up to interleavings.
- Interleavings are exactly counted by the binomial factors above.

Hence the formula counts all and only minimal-cost sequences.

## Complexity

- Sorting: `O(N log N)`
- Counting groups + combinatorics: `O(N)`
- Total: `O(N log N)`
- Memory: `O(N)`

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt
```

## Samples

Input

```text
4
1 4 2 3
```

Output

```text
1
```

Input

```text
6
3 1 8 1 5 8
```

Output

```text
6
```

Input

```text
12
3 9 0 7 0 7 9 0 7 9 7 3
```

Output

```text
4490640
```
