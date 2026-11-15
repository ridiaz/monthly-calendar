#!/bin/sh
# Arranca el dev server de este proyecto Angular 4 (2017) con el Node 10 local
# (Node moderno no puede ejecutar @angular/cli 1.0.0 / webpack 2).
# Node 10 x64 corre via Rosetta 2 en Apple Silicon.
DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$DIR/.tools/node-v10.24.1-darwin-x64/bin/node" "$DIR/node_modules/@angular/cli/bin/ng" serve
