npm run build --prefix wikiweb
rm -rf ./src/cardsweb/static
mkdir ./src/cardsweb/static
cp -r ./wikiweb/build/* ./src/cardsweb/static
rm -rf ./wikiweb/build
mkdir ./wikiweb/build
cp -r ./src/cardsweb/static/static/* ./src/cardsweb/static
rm -rf ./src/cardsweb/static/static