import { useState } from "react";

const AddEdditRecipeForm = ({ handleAddRecipe }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [publishDate, setpublishDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [directions, setDirections] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState("");

  const handleRecipeFormSubmit = (e) => {
    e.preventDefault();
    if (ingredients.length === 0) {
      alert("Ingredients cannot be empty. Please add at least one ingredient.");
      return;
    }
    const isPublished = new Date(publishDate) <= new Date() ? true : false;
    const newRecipe = {
      name,
      category,
      directions,
      publishDate: new Date(publishDate),
      isPublished,
      ingredients,
    };
    handleAddRecipe(newRecipe);
  };

  const handleAddIngredient = (e) => {
    // prevents other keys from submitting
    if (e.key && e.key !== "Enter") {
      return;
    }
    e.preventDefault();
    if (!ingredientName) {
      alert("Missing ingredient field!");
      return;
    }
    setIngredients((prev) => [...prev, ingredientName]);
    setIngredientName("");
  };

  return (
    <form
      onSubmit={handleRecipeFormSubmit}
      className="add-edit-recipe-form-container"
    >
      <h2>Add a new recipe</h2>
      <div className="top-form-section">
        <div className="fields">
          <label className="recipe-label input-label">
            Recipe name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-text"
            />
          </label>
          <label className="recipe-label input-label">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
          <label className="recipe-lebel input-label">
            Directions
            <textarea
              required
              value={directions}
              onChange={(e) => setDirections(e.target.value)}
              className="directions input-text"
            ></textarea>
          </label>
          <label className="recipe-label input-label">
            Publish date
            <input
              type="date"
              required
              value={publishDate}
              onChange={(e) => setpublishDate(e.target.value)}
              className="input-text"
            />
          </label>
        </div>
      </div>
      <div className="ingredients-list">
        <h3 className="text-center">Ingredients</h3>
        <table className="ingredients-table">
          <thead>
            <tr>
              <th className="table-header">Ingredient</th>
              <th className="table-header">Delete</th>
            </tr>
          </thead>
          <tbody>
            {ingredients && ingredients.length > 0
              ? ingredients.map((ingredient) => {
                  return (
                    <tr key={ingredient}>
                      <td className="table-data text-center">{ingredient}</td>
                      <td className="ingredient-delete-box">
                        <button
                          type="button"
                          className="secondary-button ingredient-delete-button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
        {ingredients && ingredients.length === 0 ? (
          <h3 className="text-center no-ingredients">
            No ingredients added yet.
          </h3>
        ) : null}
        <div className="ingredient-form">
          <label className="ingredient-label">
            Ingredient:
            <input
              type="text"
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              className="input-text"
              placeholder="One cup of sugar"
              // this is used so that user can add ingredient when pressing Enter key
              onKeyDown={handleAddIngredient}
            />
            <button
              className="primary-button add-ingredient-button"
              type="button"
              onClick={handleAddIngredient}
            >
              Add ingredient
            </button>
          </label>
        </div>
      </div>
      <div className="action-buttons">
        <button type="submit" className="primary-button action-button">
          Create recipe
        </button>
      </div>
    </form>
  );
};

export default AddEdditRecipeForm;
