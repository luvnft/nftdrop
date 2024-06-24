import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';

const firebaseConfig = {
	apiKey: 'AIzaSyALa6V71BIS4zbkdb7dpDigCt8CiicEWY8',
	authDomain: 'nft-surprise.firebaseapp.com',
	projectId: 'nft-surprise',
	storageBucket: 'nft-surprise.appspot.com',
	messagingSenderId: '256932602917',
	appId: '1:256932602917:web:f5439c79f18beae76e0bcc',
	measurementId: 'G-SJY57JX10E'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
