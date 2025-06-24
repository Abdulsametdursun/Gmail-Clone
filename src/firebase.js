import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyBZrP62xrQ0i61p22Rf_7vpMNJwm6Y0xRE',
  authDomain: 'clone-b8b91.firebaseapp.com',
  projectId: 'clone-b8b91',
  storageBucket: 'clone-b8b91.firebasestorage.app',
  messagingSenderId: '783540735934',
  appId: '1:783540735934:web:19b82378be886f3ef433ef',
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider };
