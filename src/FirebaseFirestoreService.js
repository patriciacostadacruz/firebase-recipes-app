import Firebase from "./FirebaseConfig";

const Firestore = Firebase.firestore();

const createDocument = (collection, document) => {
  return Firestore.collection(collection).add(document);
};

const firebaseFirestoreService = {
  createDocument,
};

export default firebaseFirestoreService;
