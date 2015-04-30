#!/bin/bash
trap 'kill $$' SIGINT

PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DB=$1
QUERY=$2
if [[ "$QUERY" == "-a" ]]; then
  OUTPUT=""
  OUTPUTLINES=0
fi

FILE=$(bash $PREFIX/read-inspect.sh -nk conf)

# these conditions are a mess. need to clean them up
for ENTRY in ${FILE[@]}
do
  if [[ "$ENTRY" == *"@"* && "$INSIDE" = true ]]; then ((OUTPUTLINES++)); fi
  if [[ "$ENTRY" == "!" && "$INSIDE" = true ]]; then
    echo "$OUTPUTLINES $OUTPUT"
    break
  elif [[ "$ENTRY" == "$DB" ]]; then INSIDE=true
  elif [[ "$NEXTOUT" == true ]]; then
    if [[ "$QUERY" != "-a" ]]; then
      echo "$ENTRY"
      break
    else
      OUTPUT="$OUTPUT $ENTRY "
    fi
  elif [[ "$INSIDE" = true && "$ENTRY" == "$QUERY" ]]; then NEXTOUT=true
  elif [[ "$INSIDE" = true && "$QUERY" == "-a" ]]; then
    NEXTOUT=true
    OUTPUT="$OUTPUT $ENTRY "
  fi
done