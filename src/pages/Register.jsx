import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await register(username, email, password);
      navigate("/login");
    } catch (error) {
      setErrorMsg(
        error?.message || "Registration failed. Please try again."
      );
      console.error("Registration error:", error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register__card">
        <h1 className="register__title">Create Your Account </h1>
        <p className="register__subtitle">
          Start sharing your travel adventures today.
        </p>

        {errorMsg && (
          <div className="register__error" role="alert">
            <span className="register__errorIcon">⚠</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="register__form">
          <label className="register__label">
            Username
            <input
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="register__input"
              required
              disabled={loading}
            />
          </label>

          <label className="register__label">
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="register__input"
              required
              disabled={loading}
            />
          </label>

          <label className="register__label">
            Password
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register__input"
              required
              disabled={loading}
            />
          </label>

          <button
            type="submit"
            className="register__button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="register__loginLink">
          Already have an account?{" "}
          <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
