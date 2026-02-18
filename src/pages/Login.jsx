import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard"); //changed
    } catch (error) {
      setErrorMsg(error?.message || "Login failed. Please try again.");
      console.error("Login error:", error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      if (!loginWithGoogle) {
        throw new Error(
          "Google login is not set up yet. Add loginWithGoogle to AuthContext."
        );
      }
      await loginWithGoogle();
      navigate("/dashboard"); //changed
    } catch (error) {
      setErrorMsg(error?.message || "Google login failed. Please try again.");
      console.error("Google login error:", error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        <h1 className="login__title">Welcome Back to Your World</h1>
        <p className="login__subtitle">Log in to continue your travel journey.</p>

        {errorMsg && (
          <div className="login__error" role="alert" aria-live="polite">
            <span className="login__errorIcon" aria-hidden="true">⚠</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login__form">
          <label className="login__label">
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login__input"
              required
              disabled={loading}
            />
          </label>

          <label className="login__label">
            Password
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login__input"
              required
              disabled={loading}
            />
          </label>

          <button type="submit" className="login__button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login__divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="login__googleBtn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span className="login__googleIcon" aria-hidden="true">G</span>
          Continue with Google
        </button>

        <p className="login__register">
          Don’t have an account?{" "}
          <Link className="login__registerLink" to="/register">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
