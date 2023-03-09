// eslint-disable-next-line no-unused-vars
import { useState, useEffect, useRef, startTransition } from "react";
import firebaseAuthService from "./FirebaseAuthService";
import LoginForm from "./components/LoginForm";
import firebaseFirestoreService from "./FirebaseFirestoreService";
import AddEditRecipeForm from "./components/AddEditRecipeForm";
// eslint-disable-next-line no-unused-vars
import firebase from "./FirebaseConfig";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  // recipe to be edited
  const [currentRecipe, setCurrentRecipe] = useState(null);
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
    const queries = [];
    if (!user) {
      // only pulls published recipes for non logged in users
      queries.push({
        field: "isPublished",
        condition: "==",
        value: true,
      });
    }
    let fetchedRecipes = [];
    try {
      const response = await firebaseFirestoreService.readDocuments({
        collection: "recipes",
        queries: queries,
      });
      const newRecipes = response.docs.map((recipeDoc) => {
        const id = recipeDoc.id;
        // retrieving data from the recipe document
        const data = recipeDoc.data();
        // changing date to a readable format
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

  const handleUpdateRecipe = async (newRecipe, recipeId) => {
    try {
      await firebaseFirestoreService.updateDocument(
        "recipes",
        recipeId,
        newRecipe
      );
      handleFetchRecipes();
      alert(`Successfully updated a recipe with ID ${recipeId}`);
      setCurrentRecipe(null);
    } catch (error) {
      alert(error.message);
      throw error;
    }
  };

  const handleEditRecipeClick = async (recipeId) => {
    // finds the recipe we are editing
    const fetchedRecipes = await fetchRecipes();
    const selectedRecipe = fetchedRecipes.find((recipe) => {
      console.log(`recipeid: ${recipeId} recipe.id: ${recipe.id}`);
      return recipe.id === recipeId;
    });
    // if there is a recipe we are editing, assigns it to its state
    if (selectedRecipe) {
      // need to be wrapped inside this hook otherwise the scroll doesn't work - from React 18 and on
      startTransition(() => {
        setCurrentRecipe(selectedRecipe);
      });
      // window.scrollTo(0, document.body.scrollHeight);
      const recipeCard = document.getElementById("edit-scroll-to");
      recipeCard.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEditRecipeCancel = () => {
    setCurrentRecipe(null);
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
                      {recipe.isPublished === false ? (
                        <div className="unpublished">UNPUBLISHED</div>
                      ) : null}
                      <div className="recipe-name">{recipe.name}</div>
                      <div className="recipe-field">
                        Category: {lookupCategoryLabel(recipe.category)}
                      </div>
                      <div className="recipe-field">
                        Publish date: {formatDate(recipe.publishDate)}
                      </div>
                      {user ? (
                        <button
                          type="button"
                          onClick={() => handleEditRecipeClick(recipe.id)}
                          className="primary-button edit-button"
                        >
                          Edit
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        <div id="edit-scroll-to">
          {user ? (
            <AddEditRecipeForm
              existingRecipe={currentRecipe}
              handleAddRecipe={handleAddRecipe}
              handleUpdateRecipe={handleUpdateRecipe}
              handleEditRecipeCancel={handleEditRecipeCancel}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
