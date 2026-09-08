#!/usr/bin/env bash
# Cloud Agent install script for vfbc-platform.
# Idempotent: safe to run repeatedly against cached or partially prepared state.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "==> Installing Next.js app dependencies (npm ci)"
npm ci

echo "==> Preparing Python environment for services/legal-rag"
# The default image ships Python 3.12 but not the venv/ensurepip module.
if ! python3 -c "import ensurepip" >/dev/null 2>&1; then
  echo "    ensurepip missing; installing python3.12-venv"
  sudo apt-get update -qq
  sudo apt-get install -y -qq python3.12-venv
fi

cd services/legal-rag
python3 -m venv .venv
./.venv/bin/pip install --upgrade pip
./.venv/bin/pip install -r requirements.txt

echo "==> Install complete"
