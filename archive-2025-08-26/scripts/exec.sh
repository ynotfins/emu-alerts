#!/usr/bin/env bash
set -o errexit -o pipefail

# Usage: run <name> <command...>
# - Persists full logs to logs/<name>_<UTC>.log
# - Shows a 200-line tail (<=100 KB) on console
# - Preserves command exit status

run() {
  local name="${1}"; shift
  local ts="$(date -u +%Y%m%dT%H%M%SZ)"
  local log="logs/${name}_${ts}.log"
  mkdir -p logs
  : "${RUN_TIMEOUT_SECONDS:=1800}" # 30m default
  : "${TZ:=UTC}"

  echo ">> [${name}] starting @ ${ts} (timeout=${RUN_TIMEOUT_SECONDS}s)"
  { /usr/bin/timeout "${RUN_TIMEOUT_SECONDS}s" "$@" 2>&1 | tee "${log}"; } || true
  status=${PIPESTATUS[0]}
  echo "::exit_status=${status}" | tee -a "${log}"
  echo "---- tail(${name}) ----"
  tail -n 200 "${log}" | head -c 100000
  echo ">> [${name}] finished with status=${status}"
  return "${status}"
}
