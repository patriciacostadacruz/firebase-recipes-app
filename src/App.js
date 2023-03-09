import { useState } from "react";
import firebaseAuthService from "./FirebaseAuthService";
import LoginForm from "./components/LoginForm";
import firebaseFirestoreService from "./FirebaseFirestoreService";
import AddEditRecipeForm from "./components/AddEditRecipeForm";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  // listens to any change in auth, assigns new value
  firebaseAuthService.subscribeToAuthChanges(setUser);

  const handleAddRecipe = async (newRecipe) => {
    try {
      const response = await firebaseFirestoreService.createDocument(
        "recipes",
        newRecipe
      );
      alert(`Successfully created a recipe with an ID = ${response.id}`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title">Firebase recipes</h1>
        <LoginForm existingUser={user} />
      </div>
      <div className="main">
        <AddEditRecipeForm handleAddRecipe={handleAddRecipe} />
      </div>
    </div>
  );
}

export default App;
