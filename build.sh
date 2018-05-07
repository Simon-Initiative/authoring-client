#!/bin/sh

if [[ -n "$1" ]]; then
    yarn && npm run dist && docker build -f Dockerfile-dist -t oli/author:$1 .
else
    yarn && npm run dist && docker build -f Dockerfile-dist -t oli/author .
fi

