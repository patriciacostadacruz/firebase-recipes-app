import { useState } from "react";
import firebaseAuthService from "./FirebaseAuthService";
import LoginForm from "./components/LoginForm";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  // listens to any change in auth, assigns new value
  firebaseAuthService.subscribeToAuthChanges(setUser);

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title">Firebase recipes</h1>
        <LoginForm existingUser={user} />
      </div>
    </div>
  );
}

export default App;
