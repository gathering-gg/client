
OS=$1
URL=$(curl \
  -s \
  -u "ethanmick:$GITHUB_TOKEN" \
  -H 'Accept: application/vnd.github.v3+json' \
  -H 'User-Agent: gathering.gg-ci' \
  https://api.github.com/repos/gathering-gg/parser/releases/latest \
  | jq -r ".assets[] | select(.name | contains(\"$OS\")) | .url"
)

if [[ $OS == "windows" ]]; then
  curl -s -o "resources/$OS/gathering.exe" \
    -u "ethanmick:$GITHUB_TOKEN" \
    $URL
  chmod +x "resources/$OS/gathering.exe"
else 
  curl -s -o "resources/$OS/gathering" \
    -u "ethanmick:$GITHUB_TOKEN" \
    $URL
  chmod +x "resources/$OS/gathering"
fi

