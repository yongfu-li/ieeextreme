#!/usr/bin/env bash
set -euo pipefail

# Compile + evaluate helper for task26.
#
# Usage:
#   ./check.sh --input fail.in
#   ./check.sh --dir cases/
#
# Optional:
#   --solver ./main_custom
#   --cxxflags "-std=c++17 -O3 -pipe"

INPUT_FILE=""
INPUT_DIR=""
SOLVER="./main"
CXXFLAGS="-std=c++17 -O2 -pipe -Wall -Wextra -pedantic"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --input) INPUT_FILE="$2"; shift 2 ;;
    --dir) INPUT_DIR="$2"; shift 2 ;;
    --solver) SOLVER="$2"; shift 2 ;;
    --cxxflags) CXXFLAGS="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$INPUT_FILE" && -z "$INPUT_DIR" ]]; then
  echo "Provide --input <file> or --dir <directory>." >&2
  exit 1
fi
if [[ -n "$INPUT_FILE" && -n "$INPUT_DIR" ]]; then
  echo "Use only one of --input or --dir." >&2
  exit 1
fi

echo "[1/2] Compiling solver..."
g++ $CXXFLAGS -o "$SOLVER" main.cpp

echo "[2/2] Running evaluator..."
if [[ -n "$INPUT_FILE" ]]; then
  python3 evaluator.py --input "$INPUT_FILE" --solver "$SOLVER"
else
  python3 evaluator.py --dir "$INPUT_DIR" --solver "$SOLVER"
fi

echo "All checks passed."
