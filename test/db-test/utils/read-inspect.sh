PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $(cat $PREFIX/temp.$1.out)
rm $PREFIX/temp.$1.out