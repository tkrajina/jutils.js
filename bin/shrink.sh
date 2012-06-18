mkdir -p shrinked
yui-compressor jutils.js > "shrinked/jutils-`head -1 VERSION`.js"
