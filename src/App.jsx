import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import RecipeList from "./components/Recipes/RecipeList";
import RecipeForm from "./components/Recipes/RecipeForm";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./components/Auth/PrivateRoute";
import Favorites from "./pages/Favorites";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/recipe" element={<RecipeList />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route
          path="/add"
          element={
            <PrivateRoute>
              <RecipeForm />
            </PrivateRoute>
          }
        />
        <Route path="/favorites" element={<Favorites />} />

      </Routes>
    
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
