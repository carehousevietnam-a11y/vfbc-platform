#!/usr/bin/env bash
# Add swap on VPS for legal-rag OOM safety (idempotent).
# Run on VPS as root: bash scripts/setup-vps-swap.sh

set -euo pipefail

SWAP_SIZE="${SWAP_SIZE:-4G}"
SWAP_FILE="${SWAP_FILE:-/swapfile}"
SWAPPINESS="${SWAPPINESS:-10}"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root (e.g. ssh root@152.42.183.74 'bash -s' < scripts/setup-vps-swap.sh)" >&2
  exit 1
fi

echo "=== BEFORE ==="
free -h
swapon --show || true
echo

if swapon --show | grep -q "${SWAP_FILE}"; then
  echo "Swap already active at ${SWAP_FILE}; skipping creation."
else
  if [[ -f "${SWAP_FILE}" ]]; then
    echo "Found existing ${SWAP_FILE}; enabling swap."
    chmod 600 "${SWAP_FILE}"
    mkswap "${SWAP_FILE}" >/dev/null
    swapon "${SWAP_FILE}"
  else
    echo "Creating ${SWAP_SIZE} swap file at ${SWAP_FILE}..."
    fallocate -l "${SWAP_SIZE}" "${SWAP_FILE}"
    chmod 600 "${SWAP_FILE}"
    mkswap "${SWAP_FILE}"
    swapon "${SWAP_FILE}"
  fi
fi

FSTAB_LINE="${SWAP_FILE} none swap sw 0 0"
if grep -qF "${SWAP_FILE}" /etc/fstab 2>/dev/null; then
  echo "/etc/fstab already contains ${SWAP_FILE}."
else
  echo "Adding ${SWAP_FILE} to /etc/fstab..."
  echo "${FSTAB_LINE}" >> /etc/fstab
fi

echo "Setting vm.swappiness=${SWAPPINESS}..."
sysctl "vm.swappiness=${SWAPPINESS}"
if grep -qE '^[[:space:]]*vm\.swappiness=' /etc/sysctl.conf 2>/dev/null; then
  sed -i "s/^[[:space:]]*vm\.swappiness=.*/vm.swappiness=${SWAPPINESS}/" /etc/sysctl.conf
else
  echo "vm.swappiness=${SWAPPINESS}" >> /etc/sysctl.conf
fi

echo
echo "=== AFTER ==="
free -h
swapon --show
echo
grep -F "${SWAP_FILE}" /etc/fstab || true
grep -E '^[[:space:]]*vm\.swappiness=' /etc/sysctl.conf || true

echo
echo "=== legal-rag (no restart) ==="
docker ps --filter name=legal-rag --format 'table {{.Names}}\t{{.Status}}' || true
curl -sS http://127.0.0.1:8080/health || true
echo
curl -sS http://127.0.0.1:8080/ready | python3 -m json.tool 2>/dev/null || curl -sS http://127.0.0.1:8080/ready || true
echo
echo "Done."
