#!/bin/bash

DUMP_FILE='./dump.txt'

dump() {
  echo '----------------------------------------------------------------' >>"${DUMP_FILE}"
  echo "Below is the content of the file ${1}" >>"${DUMP_FILE}"
  echo '----------------------------------------------------------------' >>"${DUMP_FILE}"
  cat "${1}" >>"${DUMP_FILE}"
  echo '' >>"${DUMP_FILE}"
}

rm -rf "${DUMP_FILE}"

dump ./README.md
dump ./LICENSE
dump ./deno.json
dump ./mod.ts
dump ./types.ts

for file in ./src/*; do
  dump "${file}"
done
