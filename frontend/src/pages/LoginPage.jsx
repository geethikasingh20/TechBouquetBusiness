import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi, verifyEmailApi } from "../data/api";

export default function LoginPage() {
  const { user, login, verifyEmail } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.token) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await loginApi({ email: form.email, password: form.password });
      login({ name: response.name, email: form.email, emailVerified: response.emailVerified, token: response.token });
      navigate("/");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  const handleVerify = async () => {
    if (!user?.token) return;
    try {
      await verifyEmailApi(user.token);
      verifyEmail();
    } catch (err) {
      setError("Email verification failed.");
    }
  };

  return (
    <div className="page auth-page">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email Address
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button className="primary" type="submit">Login</button>
      </form>

      <div className="reset-box">
        <h4>Forgot your password?</h4>
        <input
          type="email"
          placeholder="Email address"
          value={resetEmail}
          onChange={(event) => setResetEmail(event.target.value)}
        />
        <button className="ghost" type="button">Reset your password</button>
      </div>

      {user && (
        <div className="welcome-box">
          <p>Welcome {user.name}</p>
          {!user.emailVerified && (
            <button className="primary" onClick={handleVerify}>Verify Email Address</button>
          )}
          <button className="ghost" type="button">Support: support@techbouquet.com</button>
        </div>
      )}
    </div>
  );
}
