import Firebase from "./FirebaseConfig";

const Firestore = Firebase.firestore();

const createDocument = (collection, document) => {
  return Firestore.collection(collection).add(document);
};

const readDocuments = ({ collection, queries }) => {
  let collectionRef = Firestore.collection(collection);
  if (queries && queries.length > 0) {
    for (const query of queries) {
      collectionRef = collectionRef.where(
        query.field,
        query.condition,
        query.value
      );
    }
  }
  return collectionRef.get();
};

const firebaseFirestoreService = {
  createDocument,
  readDocuments,
};

export default firebaseFirestoreService;
