import { useState, useEffect } from "react";
import firebaseAuthService from "./FirebaseAuthService";
import LoginForm from "./components/LoginForm";
import firebaseFirestoreService from "./FirebaseFirestoreService";
import AddEditRecipeForm from "./components/AddEditRecipeForm";
// eslint-disable-next-line no-unused-vars
import firebase from "./FirebaseConfig";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetchRecipes()
      .then((fetchedRecipes) => {
        setRecipes(fetchedRecipes);
      })
      .catch((error) => {
        console.error(error.message);
        throw error;
      });
  }, [user]);

  // listens to any change in auth, assigns new value
  firebaseAuthService.subscribeToAuthChanges(setUser);

  const fetchRecipes = async () => {
    let fetchedRecipes = [];
    try {
      const response = await firebaseFirestoreService.readDocuments("recipes");
      const newRecipes = response.docs.map((recipeDoc) => {
        const id = recipeDoc.id;
        const data = recipeDoc.data();
        data.publishDate = new Date(data.publishDate.seconds * 1000);
        return { ...data, id };
      });
      fetchedRecipes = [...newRecipes];
    } catch (error) {
      console.error(error.message);
      throw error;
    }
    return fetchedRecipes;
  };

  const handleFetchRecipes = async () => {
    try {
      const fetchedRecipes = await fetchRecipes();
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  };

  const handleAddRecipe = async (newRecipe) => {
    try {
      const response = await firebaseFirestoreService.createDocument(
        "recipes",
        newRecipe
      );
      handleFetchRecipes();
      alert(`Successfully created a recipe with an ID = ${response.id}`);
    } catch (error) {
      alert(error.message);
    }
  };

  const lookupCategoryLabel = (categoryKey) => {
    const categories = {
      breadsSandwichesAndPizzas: "Breads, sandwiches and pizzas",
      eggsAndBreakfast: "Eggs and breakfast",
      desertsAndBakedGoods: "Deserts and baked goods",
      fishAndSeafood: "Fish and seafood",
      vegetables: "Vegetables",
    };
    const label = categories[categoryKey];
    return label;
  };

  const formatDate = (date) => {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getFullYear();
    const dateString = `${month} ${day} ${year}`;
    return dateString;
  };

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title">Firebase recipes</h1>
        <LoginForm existingUser={user} />
      </div>
      <div className="main">
        <div className="center">
          <div className="recipe-dash-box">
            {recipes && recipes.length > 0 ? (
              <div className="recipe-list">
                {recipes.map((recipe) => {
                  return (
                    <div className="recipe-card" key={recipe.id}>
                      <div className="recipe-name">{recipe.name}</div>
                      <div className="recipe-field">
                        Category: {lookupCategoryLabel(recipe.category)}
                      </div>
                      <div className="recipe-field">
                        Publish date: {formatDate(recipe.publishDate)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        {user ? <AddEditRecipeForm handleAddRecipe={handleAddRecipe} /> : null}
      </div>
    </div>
  );
}

export default App;
