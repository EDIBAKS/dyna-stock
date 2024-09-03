import { initializeApp } from 'firebase/app';
import { getFirestore,collection, getDocs,addDoc,doc,getDoc  } from 'firebase/firestore';
import {getAuth} from 'firebase/auth'
const firebaseConfig = {
    apiKey: "AIzaSyAOqb6M5BHKx7msDTqmztY-f1BgIM6i2JY",
    authDomain: "vueonlinestore-fd16e.firebaseapp.com",
    projectId: "vueonlinestore-fd16e",
    storageBucket: "vueonlinestore-fd16e.appspot.com",
    messagingSenderId: "941979578285",
    appId: "1:941979578285:web:ae4324ebce84186214bb24"
  }
  
 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth=getAuth(app)
export { db,auth };