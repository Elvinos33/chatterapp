// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";

import { getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

    apiKey: "AIzaSyAlFpib2xmQnO4U89yPSotD6TB4Dl7rX5U",

    authDomain: "chatappyff.firebaseapp.com",

    projectId: "chatappyff",

    storageBucket: "chatappyff.appspot.com",

    messagingSenderId: "950225970421",

    appId: "1:950225970421:web:126e54c89002fe909791bc",

    measurementId: "G-7Q20931YJE"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence);

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log(`User ${user.displayName} is signed in`);
    } else {
        console.log("User is signed out");
    }
})