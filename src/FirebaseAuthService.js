import Firebase from "./FirebaseConfig";

const auth = Firebase.auth();

const registerUser = (email, password) => {
  // following method returns a promise
  return auth.createUserWithEmailAndPassword(email, password);
};

const loginUser = (email, password) => {
  return auth.signInWithEmailAndPassword(email, password);
};

const logoutUser = () => {
  return auth.signOut();
};

const sendPasswordResetEmail = (email) => {
  return auth.sendPasswordResetEmail(email);
};

const loginWithGoogle = () => {
  const provider = new Firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
};

const subscribeToAuthChanges = (handleAuthChange) => {
  auth.onAuthStateChanged((user) => {
    handleAuthChange(user);
  });
};

const firebaseAuthService = {
  registerUser,
  loginUser,
  logoutUser,
  sendPasswordResetEmail,
  loginWithGoogle,
  subscribeToAuthChanges,
};

export default firebaseAuthService;
