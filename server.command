# safely switch to the directory the script is in
here="`dirname \"$0\"`"
echo "cd-ing to $here"
cd "$here" || exit 1

node server.js