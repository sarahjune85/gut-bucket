import firebase from "firebase/compat/app";
import firebaseConfig from "./firebase.config";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// take data from user object to store in our db:
export const createUserProfileDocument = async (userAuth, additionalData) => {
  // if userAuth does not exist, return:
  if (!userAuth) return;

  // get userID from firestore queryReference object
  const userRef = firestore.doc(`users/${userAuth.uid}`);

  // get snapShot using .get(), async function - use await
  const snapShot = await userRef.get();

  if (!snapShot.exists) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();

    //try/catch block for async request to store user data:
    try {
      await userRef.set({
        displayName,
        email,
        createdAt,
        ...additionalData,
      });
    } catch (error) {
      console.log("error creating user", error.message);
    }
  }
  // Firestore library either return a reference or a snapshot object.
  // of these, they can be either document or collection versions.
  console.log(snapShot);
  return userRef;
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();

// gives us access to GoogleAuthProvider platform from auth library
const provider = new firebase.auth.GoogleAuthProvider();
// trigger google user prompt:
provider.setCustomParameters({ prompt: "select_account" });

// popup from firebase library:
export const signInWithGoogle = () => auth.signInWithPopup(provider);

export default firebase;