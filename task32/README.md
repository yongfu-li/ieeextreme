# Points in Polygon

## Problem Overview

Given a simple polygon (clockwise vertices, not necessarily convex) and `M` query points, count how many points are:

- strictly inside the polygon, or
- on polygon edges.

Constraints require fast queries: `N <= 2000`, `M <= 1e5`.

## Core Idea

Use vertical-ray parity (`inside` iff number of intersections above point is odd), but preprocess geometry to answer each query in `O(log N)`.

### 1) Vertical stripes by polygon vertex x-coordinates

Let sorted distinct vertex x-values be:

- `x0 < x1 < ... < xt`

This defines stripes `(xi, xi+1)`.
Inside one stripe, edge order by y is fixed (polygon is simple, no self-intersections).

For each stripe, store all non-vertical edges that fully traverse that stripe and sort them by y.

### 2) Special preprocessing for query x equal to a vertex x-line

For each line `x = xi`, preprocess:

- vertical edge y-intervals on that line (for boundary checks),
- non-vertical edges intersecting that line, sorted by y at `x = xi`.

This allows fast boundary detection even when query x is exactly on stripe borders.

## Query Handling

For each point `(px, py)`:

1. Check if point lies on boundary:
   - vertical intervals (if `px` equals a vertex-x),
   - nearby non-vertical edges by binary search in the relevant sorted edge list.
2. If not boundary, compute parity:
   - if `px` is on a vertex-x line, use stripe immediately to the right (`x + epsilon`), or left if no right stripe,
   - else use the stripe containing `px`.
3. Count how many stripe edges have intersection y strictly above `py` by binary search; odd => inside.

## Correctness Intuition

- Vertical ray criterion is valid for simple polygons.
- Within one stripe, edge order is stable, enabling binary search on y.
- Using right stripe for `px` on a border emulates infinitesimal perturbation and avoids vertex double-count ambiguity.
- Explicit boundary checks ensure points on edges are counted.

## Complexity

- Preprocessing:
  - stripe/line edge collection and sorting: `O(N^2 log N)` (with `N <= 2000`, this is fine)
- Query:
  - `O(log N)` per point

Total query phase: `O(M log N)`.

## Build

```bash
g++ -std=c++17 -O2 -pipe -Wall -Wextra -pedantic -o main main.cpp
```

## Run

```bash
./main < input.txt
```

## Provided Samples

All four sample inputs from the statement produce:

```text
2
```
