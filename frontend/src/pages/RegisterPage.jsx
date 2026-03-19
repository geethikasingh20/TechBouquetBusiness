import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerApi } from "../data/api";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await registerApi({
        name: form.name,
        email: form.email,
        phoneNumber: form.phone,
        password: form.password
      });
      login({ name: response.name, email: form.email, emailVerified: response.emailVerified, token: response.token });
      navigate("/");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="page auth-page">
      <h2>Create Your Account</h2>
      {error && <p className="error">{error}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email Address
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Phone Number
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </label>
        <label className="password-field">
          Password
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </label>
        <button className="primary" type="submit">Register</button>
      </form>
    </div>
  );
}
