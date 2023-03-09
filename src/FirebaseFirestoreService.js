import Firebase from "./FirebaseConfig";

const firestore = Firebase.firestore();

const createDocument = (collection, document) => {
  return firestore.collection(collection).add(document);
};

const readDocuments = ({ collection, queries }) => {
  let collectionRef = firestore.collection(collection);
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

const updateDocument = (collection, id, document) => {
  return firestore.collection(collection).doc(id).update(document);
};

const firebaseFirestoreService = {
  createDocument,
  readDocuments,
  updateDocument,
};

export default firebaseFirestoreService;
