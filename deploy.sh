#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
rm -rf dist
mkdir -p dist
cp -r public/. dist/
cd dist
git init
git branch -m main
git add -A
git commit -m 'deploy'
git remote add origin https://github.com/sch-28/war-analyzer.git
git push -f -u origin main:github_page

cd -