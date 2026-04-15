#!/usr/bin/env python3
"""Evaluator for Catch the Thief strategies.

Usage:
  python3 evaluator.py --input fail.in --solver ./main
  python3 evaluator.py --input fail.in --output out.txt
  python3 evaluator.py --dir ./cases --solver ./main
"""

from __future__ import annotations

import argparse
import subprocess
from pathlib import Path
from typing import List, Sequence, Tuple


def parse_graph(text: str) -> Tuple[int, int, List[Tuple[int, int]]]:
    tokens = text.strip().split()
    if len(tokens) < 2:
        raise ValueError("Input too short.")
    it = iter(tokens)
    n = int(next(it))
    m = int(next(it))
    edges: List[Tuple[int, int]] = []
    for _ in range(m):
        try:
            u = int(next(it))
            v = int(next(it))
        except StopIteration as exc:
            raise ValueError("Input ended before all edges were read.") from exc
        edges.append((u - 1, v - 1))
    return n, m, edges


def parse_output(text: str) -> Tuple[int, List[int]]:
    tokens = text.strip().split()
    if not tokens:
        raise ValueError("Empty solver output.")
    if tokens[0] == "-1":
        return -1, []
    k = int(tokens[0])
    seq = [int(x) - 1 for x in tokens[1:]]
    if len(seq) != k:
        raise ValueError(f"K={k} but got {len(seq)} moves.")
    return k, seq


def simulate_guarantee(n: int, edges: Sequence[Tuple[int, int]], seq: Sequence[int]) -> Tuple[bool, int]:
    adj: List[List[int]] = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)

    possible = [True] * n
    next_possible = [False] * n

    for x in seq:
        if x < 0 or x >= n:
            return False, sum(possible)
        # Day check: thief cannot be at x right now.
        possible[x] = False

        # Night move: thief must move to one neighbor.
        for i in range(n):
            next_possible[i] = False
        for u in range(n):
            if not possible[u]:
                continue
            for v in adj[u]:
                next_possible[v] = True
        possible, next_possible = next_possible, possible

    remaining = sum(1 for x in possible if x)
    return remaining == 0, remaining


def run_solver(solver: str, input_text: str) -> str:
    proc = subprocess.run(
        [solver],
        input=input_text.encode(),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if proc.returncode != 0:
        err = proc.stderr.decode(errors="replace").strip()
        raise RuntimeError(f"Solver exited with code {proc.returncode}. stderr: {err}")
    return proc.stdout.decode(errors="replace")


def evaluate_case(input_path: Path, solver: str | None, output_path: Path | None) -> bool:
    input_text = input_path.read_text(encoding="utf-8")
    n, m, edges = parse_graph(input_text)

    if solver is not None:
        output_text = run_solver(solver, input_text)
    elif output_path is not None:
        output_text = output_path.read_text(encoding="utf-8")
    else:
        raise ValueError("Either solver or output_path must be provided.")

    try:
        k, seq = parse_output(output_text)
    except Exception as exc:
        print(f"[FAIL] {input_path.name}: output parse error: {exc}")
        return False

    if k == -1:
        print(f"[INFO] {input_path.name}: solver returned -1 (not auto-judged for existence).")
        return True

    if k >= 10 * n:
        print(f"[FAIL] {input_path.name}: K={k} is not < 10*N ({10*n}).")
        return False

    ok, remaining = simulate_guarantee(n, edges, seq)
    if ok:
        print(f"[PASS] {input_path.name}: guaranteed capture, K={k}.")
        return True

    print(f"[FAIL] {input_path.name}: NOT guaranteed (remaining possible nodes: {remaining}), K={k}.")
    return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate Catch the Thief outputs.")
    parser.add_argument("--input", type=Path, help="Single testcase input file.")
    parser.add_argument("--output", type=Path, help="Single solver output file.")
    parser.add_argument("--solver", type=str, help="Path to solver executable (e.g. ./main).")
    parser.add_argument("--dir", type=Path, help="Directory of .in files to evaluate.")
    args = parser.parse_args()

    if args.input is None and args.dir is None:
        raise SystemExit("Provide --input or --dir.")
    if args.output is not None and args.solver is not None:
        raise SystemExit("Use either --output or --solver, not both.")
    if args.output is None and args.solver is None:
        raise SystemExit("Provide --solver or --output.")
    if args.output is not None and args.dir is not None:
        raise SystemExit("--output is only valid with --input.")

    overall_ok = True
    if args.input is not None:
        overall_ok &= evaluate_case(args.input, args.solver, args.output)
    else:
        files = sorted(args.dir.glob("*.in"))
        if not files:
            raise SystemExit(f"No .in files found in {args.dir}")
        for fp in files:
            overall_ok &= evaluate_case(fp, args.solver, None)

    raise SystemExit(0 if overall_ok else 1)


if __name__ == "__main__":
    main()
