#!/bin/bash

rm -rf /tmp/temp-repo-for-rcli 2&>1 /dev/null
mkcd /tmp/temp-repo-for-rcli
echo "asdf" > file.txt
git init
git checkout -b master
git add -A
git commit -m "init"
git tag -a 1.0.0 -m "init"