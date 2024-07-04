import { goto } from '$app/navigation';
import { initializeApp } from '@firebase/app';
import { getAuth, isSignInWithEmailLink, signInWithEmailLink, type Auth } from '@firebase/auth';

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

async function checkEmailLink(auth: Auth) {
	if (isSignInWithEmailLink(auth, window.location.href)) {
		let email = window.localStorage.getItem('emailForSignIn');
		if (!email) {
			email = window.prompt('Please provide your email for confirmation');
			if (!email) {
				console.error('No email provided');
				goto('/');
				return;
			}
		}
		await signInWithEmailLink(auth, email, window.location.href);
		window.localStorage.removeItem('emailForSignIn');
		const cleanUrl = window.location.href.split('&')[0];
		if (cleanUrl !== window.location.href) {
			window.history.replaceState({}, document.title, cleanUrl);
		}
	}
}

export { auth, checkEmailLink };
