#!/usr/bin/env bash
# Usage: scripts/package.sh <version> <out-dir>
# Writes one zip for each app folder in dist/: <out-dir>/<app>_fa-th-ur_<version>.zip.
# Each zip holds the contents of dist/<app>/ and the MIT LICENSE.
set -euo pipefail

version="${1:?version required}"
out="${2:?out dir required}"
root="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$out"
out="$(cd "$out" && pwd)"

shopt -s nullglob
apps=("$root"/dist/*/)
if [ ${#apps[@]} -eq 0 ]; then
  echo "no app folders in dist/. Run npm run build first." >&2
  exit 1
fi

for dir in "${apps[@]}"; do
  app="$(basename "$dir")"
  zip_path="$out/${app}_fa-th-ur_$version.zip"
  rm -f "$zip_path"
  (cd "$dir" && zip -qrX "$zip_path" . -x '*.DS_Store')
  zip -qjX "$zip_path" "$root/LICENSE"
  echo "$zip_path"
done
