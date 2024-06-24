cd api
npm i
npm run build
gcloud app deploy
cd ../web
npm i
npm run build
cd ..
firebase deploy
