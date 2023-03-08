import { useState } from "react";
import firebaseAuthService from "../FirebaseAuthService";

const LoginForm = ({ existingUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await firebaseAuthService.loginUser(username, password);
      setUsername("");
      setPassword("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    firebaseAuthService.logoutUser();
  };

  const handleSendPasswordResetEmail = async () => {
    if (!username) {
      alert("Missing username!");
      return;
    }
    try {
      await firebaseAuthService.sendPasswordResetEmail(username);
      alert("Sent the password reset email.");
    } catch (error) {
      alert(error.message);
      console.log(error);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      await firebaseAuthService.loginWithGoogle();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-form-container">
      {existingUser ? (
        <div className="row">
          <h3>Welcome, {existingUser.email}</h3>
          <button
            type="button"
            className="primary-button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <label className="input-label login-label">
            Username (email):
            <input
              type="email"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-text"
            />
          </label>
          <label className="input-label login-label">
            Password:
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-text"
            />
          </label>
          <div className="button-box">
            <button className="primary-button">Login</button>
            <button
              onClick={handleSendPasswordResetEmail}
              className="primary-button"
              type="button"
            >
              Reset password
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleLoginWithGoogle}
            >
              Login with Google
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
