STR=$1
DELIM=$2
INDEX=$3

IFS="$DELIM" read -ra STR <<< "$STR"
if [[ "$INDEX" = "" ]]; then echo "${STR[@]}"
else
  STR="${STR[$INDEX]}"
  echo "$STR"
fi