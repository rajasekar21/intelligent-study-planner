#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIDS_FILE="$ROOT_DIR/.demo-services.pids"

if [[ ! -f "$PIDS_FILE" ]]; then
  echo "No $PIDS_FILE found. Nothing to stop."
  exit 0
fi

# shellcheck disable=SC1090
source "$PIDS_FILE"

stop_pid() {
  local name="$1"
  local pid="$2"
  if [[ -z "${pid:-}" ]]; then
    return 0
  fi

  if kill -0 "$pid" >/dev/null 2>&1; then
    kill "$pid" >/dev/null 2>&1 || true
    echo "Stopped $name (PID $pid)"
  else
    echo "$name PID $pid is not running"
  fi
}

stop_pid "AI service" "${AI_PID:-}"
stop_pid "Backend service" "${BACKEND_PID:-}"
stop_pid "Frontend UI" "${FRONTEND_PID:-}"

rm -f "$PIDS_FILE"
echo "Removed PID file: $PIDS_FILE"



