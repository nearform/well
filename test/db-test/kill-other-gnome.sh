echo KILLING TERMINALS

PIDS=$(pidof gnome-terminal)
TOPINDEX=$( echo "$PIDS" | wc -w )
((TOPINDEX=TOPINDEX-1))

I=0
for VAR in $PIDS
do
  if [ $TOPINDEX != $I ]
    then
    echo $VAR
    kill $VAR
  fi
  ((I++))
done