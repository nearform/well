#!/bin/bash
trap 'kill $$' SIGINT

NK=false # no kill
TARGET=""
for VAR in "$@"
do
    FCHAR="$(echo $VAR | head -c 1)"
    if [[ "$FCHAR" != "-" ]]; then TARGET=$VAR; fi
    
    if [[ "$VAR" = "-nk" ]]; then NK=true; fi
done

PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $(cat $PREFIX/temp.$TARGET.out)
if [[ "$NK" = false ]]; then rm $PREFIX/temp.$1.out; fi