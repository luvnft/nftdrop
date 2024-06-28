cd api
npm i
cp ../eth/artifacts/contracts/NFTAirdropTracker.sol/NFTAirdropTracker.json ./NFTAirdropTracker.json
npm run build
gcloud app deploy
cd ../web
npm i
npm run build
cd ..
firebase deploy
