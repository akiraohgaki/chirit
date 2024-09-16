#!/bin/bash

OUTPUT_FILE='./chirit.txt'

output() {
  echo '----------------------------------------------------------------' >>"${OUTPUT_FILE}"
  echo "Below is the content of the file ${1}" >>"${OUTPUT_FILE}"
  echo '----------------------------------------------------------------' >>"${OUTPUT_FILE}"
  cat "${1}" >>"${OUTPUT_FILE}"
  echo '' >>"${OUTPUT_FILE}"
}

rm -rf "${OUTPUT_FILE}"

output ./README.md
output ./LICENSE
output ./deno.json
output ./mod.ts
output ./types.ts

for file in ./src/*; do
  output "${file}"
done
