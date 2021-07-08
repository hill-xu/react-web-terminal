#!/bin/bash

git pull origin $1;
echo ('git pull origin $1');
npm run build;

mv ./build/* ../;

