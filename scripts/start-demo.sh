#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AI_DIR="$ROOT_DIR/ai-service"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
PIDS_FILE="$ROOT_DIR/.demo-services.pids"
LOG_DIR="$ROOT_DIR/.demo-logs"

AI_PORT="${AI_PORT:-8001}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5174}"
BIND_HOST="${BIND_HOST:-0.0.0.0}"
HEALTH_HOST="${HEALTH_HOST:-127.0.0.1}"
ACCESS_HOST="${ACCESS_HOST:-localhost}"

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "python3 or python is required" >&2
  exit 1
fi

command -v npm >/dev/null 2>&1 || { echo "npm is required" >&2; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "curl is required" >&2; exit 1; }

mkdir -p "$LOG_DIR"

if [[ -f "$PIDS_FILE" ]]; then
  echo "Found existing $PIDS_FILE. If services are already running, stop them first." >&2
  echo "Tip: kill the listed PIDs manually or remove the file if stale." >&2
  cat "$PIDS_FILE" || true
  exit 1
fi

activate_venv() {
  local venv_dir="$1"

  if [[ -f "$venv_dir/bin/activate" ]]; then
    # shellcheck disable=SC1091
    source "$venv_dir/bin/activate"
  elif [[ -f "$venv_dir/Scripts/activate" ]]; then
    # Git Bash on Windows uses the Windows venv layout.
    # shellcheck disable=SC1091
    source "$venv_dir/Scripts/activate"
  else
    echo "Could not find virtual environment activation script in $venv_dir" >&2
    return 1
  fi
}

start_python_service() {
  local service_dir="$1"
  local requirements_file="$2"
  local uvicorn_target="$3"
  local port="$4"
  local log_file="$5"
  local init_cmd="${6:-}"

  local venv_dir="$service_dir/.venv"
  if [[ ! -d "$venv_dir" ]]; then
    echo "Creating virtual environment in $venv_dir" >&2
    "$PYTHON_BIN" -m venv "$venv_dir"
  fi

  activate_venv "$venv_dir"
  pip install -r "$requirements_file" >/dev/null
  if [[ -n "$init_cmd" ]]; then
    (cd "$service_dir" && eval "$init_cmd")
  fi
  (cd "$service_dir" && nohup uvicorn "$uvicorn_target" --host "$BIND_HOST" --port "$port" >"$log_file" 2>&1 & echo $!)
  deactivate
}

show_log_tail() {
  local log_file="$1"

  if [[ -f "$log_file" ]]; then
    echo "Last lines from $log_file:" >&2
    tail -n 80 "$log_file" >&2 || true
  else
    echo "No log file found at $log_file" >&2
  fi
}

wait_for_url() {
  local url="$1"
  local name="$2"
  local log_file="$3"
  local max_retries=30
  local retry=1

  until curl -fsS "$url" >/dev/null 2>&1; do
    if (( retry >= max_retries )); then
      echo "ERROR: $name did not become healthy: $url" >&2
      show_log_tail "$log_file"
      return 1
    fi
    sleep 1
    ((retry++))
  done

  echo "OK: $name is running at $url"
}

echo "Starting AI service..."
AI_PID="$(start_python_service "$AI_DIR" "$AI_DIR/requirements.txt" "main:app" "$AI_PORT" "$LOG_DIR/ai-service.log")"

echo "Starting backend service..."
BACKEND_PID="$(start_python_service "$BACKEND_DIR" "$BACKEND_DIR/requirements.txt" "app.main:app" "$BACKEND_PORT" "$LOG_DIR/backend.log" "python init_lightweight_db.py >/dev/null")"

echo "Ensuring frontend dependencies..."
(
  cd "$FRONTEND_DIR"
  npm install >/dev/null
)

echo "Starting frontend UI..."
(
  cd "$FRONTEND_DIR"
  nohup npm run dev -- --host "$BIND_HOST" --port "$FRONTEND_PORT" >"$LOG_DIR/frontend.log" 2>&1 &
  echo $! > "$ROOT_DIR/.frontend.pid.tmp"
)
FRONTEND_PID="$(cat "$ROOT_DIR/.frontend.pid.tmp")"
rm -f "$ROOT_DIR/.frontend.pid.tmp"

printf "AI_PID=%s\nBACKEND_PID=%s\nFRONTEND_PID=%s\n" "$AI_PID" "$BACKEND_PID" "$FRONTEND_PID" > "$PIDS_FILE"

wait_for_url "http://${HEALTH_HOST}:${AI_PORT}/health" "AI service" "$LOG_DIR/ai-service.log"
wait_for_url "http://${HEALTH_HOST}:${BACKEND_PORT}/health" "Backend service" "$LOG_DIR/backend.log"
wait_for_url "http://${HEALTH_HOST}:${FRONTEND_PORT}" "Frontend UI" "$LOG_DIR/frontend.log"

AI_URL="http://${ACCESS_HOST}:${AI_PORT}"
BACKEND_URL="http://${ACCESS_HOST}:${BACKEND_PORT}"
FRONTEND_URL="http://${ACCESS_HOST}:${FRONTEND_PORT}"

if [[ -n "${CODESPACE_NAME:-}" ]]; then
  AI_URL="https://${CODESPACE_NAME}-${AI_PORT}.app.github.dev"
  BACKEND_URL="https://${CODESPACE_NAME}-${BACKEND_PORT}.app.github.dev"
  FRONTEND_URL="https://${CODESPACE_NAME}-${FRONTEND_PORT}.app.github.dev"
fi

cat <<MSG

Demo environment is up!
- AI service:     ${AI_URL}
- Backend API:    ${BACKEND_URL}
- Frontend UI:    ${FRONTEND_URL}

Logs:
- $LOG_DIR/ai-service.log
- $LOG_DIR/backend.log
- $LOG_DIR/frontend.log

PIDs are tracked in: $PIDS_FILE
Stop services with: $ROOT_DIR/scripts/stop-demo.sh
MSG
