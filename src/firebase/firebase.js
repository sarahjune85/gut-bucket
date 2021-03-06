import firebase from "firebase/app";
// import firebaseConfig from "./firebase.config";
import "firebase/firestore";
import "firebase/auth";
// import { collection, doc, get } from "firebase/firestore";

// creates and initializes an instance of our Firebase application:
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_API,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FB_ID,
};

const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();
export const auth = firebase.auth();
export const firestore = firebase.firestore();

export const getUserTrips = (userId) => {
  const getTrips = db.collection("users").doc(userId).collection("trips");
  return getTrips;
};

// return the location of the specific trip - used in Map to get Lat/Lng for map centering.
export const getUserTrip = (userId, tripId) => {
  const docRef = db.collection("users").doc(userId).collection("trips").doc(tripId);
  return docRef.get().then((doc) => {
    return doc.data().location;
  });
};

export const getVenues = (userId, tripId) => {
  const getVenues = db
    .collection("users")
    .doc(userId)
    .collection("trips")
    .doc(tripId)
    .collection("venues");

  return getVenues;
};

export const newTrip = (userId, location, description) => {
  const newTrip = db.collection("users").doc(userId).collection("trips");
  newTrip.doc().set({
    description: description,
    location: location,
  });
};

export const newVenue = (userId, tripId, name, website) => {
  const newVenue = db
    .collection("users")
    .doc(userId)
    .collection("trips")
    .doc(tripId)
    .collection("venues");
  newVenue.doc().set({
    name: name,
    website: website,
  });
};

export const deleteTrip = (userId, tripId) => {
  const deleteVenue = db.collection("users").doc(userId).collection("trips").doc(tripId);

  return deleteVenue;
};

export const deleteVenue = (userId, tripId, venueId) => {
  const deleteVenue = db.collection("users").doc(userId).collection("trips").doc(tripId).collection("venues").doc(venueId)
  return deleteVenue;
};

/////Authentication:
const provider = new firebase.auth.GoogleAuthProvider();
// trigger google user prompt:
provider.setCustomParameters({ prompt: "select_account" });
// popup from firebase library:
export const signInWithGoogle = () => auth.signInWithPopup(provider);

// take data from user object to store in our db:
export const createUserDocument = async (userAuth, additionalData) => {
  // if user does not exist, return:
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
  return userRef;
};

export default firebase;
