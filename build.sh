#!/bin/sh

parcel build --out-dir build --public-url /build/ src/ui/app.js
cp src/ui/style.css build
