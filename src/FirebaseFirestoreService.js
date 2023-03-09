import Firebase from "./FirebaseConfig";

const Firestore = Firebase.firestore();

const createDocument = (collection, document) => {
  return Firestore.collection(collection).add(document);
};

const readDocuments = (collection) => {
  return Firestore.collection(collection).get();
};

const firebaseFirestoreService = {
  createDocument,
  readDocuments,
};

export default firebaseFirestoreService;
