import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerApi } from "../data/api";

const NAME_REGEX = /^[A-Za-z\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const validate = () => {
    const errors = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();

    if (!trimmedName) errors.name = "Full name is required.";
    if (trimmedName && !NAME_REGEX.test(trimmedName)) {
      errors.name = "Full name should contain only letters and spaces.";
    }

    if (!trimmedEmail) errors.email = "Email address is required.";
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!trimmedPhone) errors.phone = "Phone number is required.";
    if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
      errors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!form.password.trim()) errors.password = "Password is required.";
    if (form.password.trim() && !PASSWORD_REGEX.test(form.password)) {
      errors.password = "Password must be 8+ chars with uppercase, lowercase, number, and special character.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!validate()) return;
    try {
      const response = await registerApi({
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phone.trim(),
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
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          Full Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            pattern="[A-Za-z\\s]+"
            title="Only letters and spaces are allowed"
          />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </label>
        <label>
          Email Address
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </label>
        <label>
          Phone Number
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            title="Enter a valid 10-digit Indian mobile number"
          />
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
        </label>
        <label className="password-field">
          <span className="password-label">
            Password
            <span
              className="hint-icon"
              data-tooltip="Use 8+ chars with uppercase, lowercase, number, and special character."
              aria-label="Password rules"
              tabIndex={0}
            >
              i
            </span>
          </span>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            title="8+ chars with uppercase, lowercase, number, and special character"
          />
          <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? "Hide" : "Show"}
          </button>
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </label>
        <button className="primary" type="submit">Register</button>
      </form>
    </div>
  );
}
