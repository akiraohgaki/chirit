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

output ./mod.ts
output ./dom.ts

for file in ./src/*; do
  output "${file}"
done
