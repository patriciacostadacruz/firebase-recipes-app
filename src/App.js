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
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [orderBy, setOrderBy] = useState("publishDateDesc");
  const [recipesPerPage, setRecipesPerPage] = useState(3);

  // listens to any change in auth, assigns new value
  firebaseAuthService.subscribeToAuthChanges(setUser);

  useEffect(() => {
    setIsLoading(true);
    fetchRecipes()
      .then((fetchedRecipes) => {
        setRecipes(fetchedRecipes);
      })
      .catch((error) => {
        console.error(error.message);
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, categoryFilter, orderBy, recipesPerPage]);

  const fetchRecipes = async (cursorId = "") => {
    const queries = [];
    if (categoryFilter) {
      queries.push({
        field: "category",
        condition: "==",
        value: categoryFilter,
      });
    }
    if (!user) {
      // only pulls published recipes for non logged in users
      queries.push({
        field: "isPublished",
        condition: "==",
        value: true,
      });
    }
    const orderByField = "publishDate";
    let orderByDirection = undefined;
    if (orderBy) {
      switch (orderBy) {
        case "publishDateAsc":
          orderByDirection = "asc";
          break;
        case "publishDateDesc":
          orderByDirection = "desc";
          break;
        default:
          break;
      }
    }
    let fetchedRecipes = [];
    try {
      const response = await firebaseFirestoreService.readDocuments({
        collection: "recipes",
        queries: queries,
        orderByField: orderByField,
        orderByDirection: orderByDirection,
        perPage: recipesPerPage,
        cursorId: cursorId,
      });
      const newRecipes = response.docs.map((recipeDoc) => {
        const id = recipeDoc.id;
        // retrieving data from the recipe document
        const data = recipeDoc.data();
        // changing date to a readable format
        data.publishDate = new Date(data.publishDate.seconds * 1000);
        return { ...data, id };
      });
      if (cursorId) {
        fetchedRecipes = [...recipes, ...newRecipes];
      } else {
        fetchedRecipes = [...newRecipes];
      }
    } catch (error) {
      console.error(error.message);
      throw error;
    }
    return fetchedRecipes;
  };

  const handleRecipesPerPageChange = (e) => {
    const recipesPerPage = e.target.value;
    setRecipes([]);
    setRecipesPerPage(recipesPerPage);
  };

  const handleLoadMoreRecipesClick = () => {
    const lastRecipe = recipes[recipes.length - 1];
    const cursorId = lastRecipe.id;
    handleFetchRecipes(cursorId);
  };

  const handleFetchRecipes = async (cursorId = "") => {
    try {
      const fetchedRecipes = await fetchRecipes(cursorId);
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

  const handleDeleteRecipe = async (recipeId) => {
    const deleteConfirmation = window.confirm(
      "Are you sure you want to delete this recipe? Ok for Yes, cancel for No."
    );
    if (deleteConfirmation) {
      try {
        await firebaseFirestoreService.deleteDocument("recipes", recipeId);
        handleFetchRecipes();
        setCurrentRecipe(null);
        window.scrollTo(0, 0);
        alert(`Successfully deleted recipe with ID ${recipeId}`);
      } catch (error) {
        alert(error.message);
        throw error;
      }
    }
  };

  const handleEditRecipeClick = async (recipeId) => {
    // finds the recipe we are editing
    const fetchedRecipes = await fetchRecipes();
    const selectedRecipe = fetchedRecipes.find((recipe) => {
      return recipe.id === recipeId;
    });
    // if there is a recipe we are editing, assigns it to its state
    if (selectedRecipe) {
      // need to be wrapped inside this hook otherwise the scroll doesn't work - from React 18 and on
      startTransition(() => {
        setCurrentRecipe(selectedRecipe);
      });
      const recipeCard = document.getElementById("edit-scroll-to");
      recipeCard.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEditRecipeCancel = () => {
    startTransition(() => {
      setCurrentRecipe(null);
    });
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
    // to fix month being one month earlier because of timezones
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
        <div className="row filters">
          <label className="recipe-label input-label">
            Category
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select"
              required
            >
              <option value=""></option>
              <option value="breadsSandwichesAndPizzas">
                Breads, sandwiches, pizza
              </option>
              <option value="eggsAndBreakfast">Eggs and breakfast</option>
              <option value="desertsAndBakedGoods">
                Deserts and baked goods
              </option>
              <option value="fishAndSeafood">Fish and seafood</option>
              <option value="vegetables">Vegetables</option>
            </select>
          </label>
          <label className="input-label">
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="select"
            >
              <option value="publishDateDesc">
                Publish date (newest - oldest)
              </option>
              <option value="publishDateAsc">
                Publish date (oldest - newest)
              </option>
            </select>
          </label>
        </div>
        <div className="center">
          <div className="recipe-list-box" id="edit-scroll-to">
            {isLoading ? (
              <div className="fire">
                <div className="flames">
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                </div>
                <div className="logs"></div>
              </div>
            ) : null}
            {!isLoading && recipes && recipes.length === 0 ? (
              <h5 className="no-recipes">No recipes found.</h5>
            ) : null}
            {!isLoading && recipes && recipes.length > 0 ? (
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
        {isLoading || (recipes && recipes.length > 0) ? (
          <>
            <label className="input-label">
              Recipes per page:
              <select
                className="select"
                value={recipesPerPage}
                onChange={handleRecipesPerPageChange}
              >
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
              </select>
            </label>
            <div className="pagination">
              <button
                type="button"
                className="primary-button"
                onClick={handleLoadMoreRecipesClick}
              >
                Load more recipes
              </button>
            </div>
          </>
        ) : null}
        <div>
          {user ? (
            <AddEditRecipeForm
              existingRecipe={currentRecipe}
              handleAddRecipe={handleAddRecipe}
              handleUpdateRecipe={handleUpdateRecipe}
              handleDeleteRecipe={handleDeleteRecipe}
              handleEditRecipeCancel={handleEditRecipeCancel}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
