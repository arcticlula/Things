import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBkxcpfCDMatzBp4rZV8UInG37u-3fqguE",
    authDomain: "things-storage.firebaseapp.com",
    projectId: "things-storage",
    storageBucket: "things-storage.appspot.com",
    messagingSenderId: "447316691649",
    appId: "1:447316691649:web:a6c70933d4a46b8f216240"
  };
  
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { firebaseApp, db };