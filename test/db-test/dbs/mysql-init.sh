
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

nohup gnome-terminal --disable-factory -x bash -c "bash ok.sh" >/dev/null 2>&1 &

docker run --rm --name mysql-inst -e MYSQL_ROOT_PASSWORD=password -e MYSQL_USER=admin -e MYSQL_PASSWORD=password -e MYSQL_DATABASE=admin mysql --skip-name-resolve --init-file=mysql.sql &

echo
read -p "" -n 1 -s
echo 