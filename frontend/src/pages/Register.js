import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "user"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setErrors({
      ...errors,
      [name]: "",
      general: ""
    });
  };


  const validateForm = () => {

    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    // Password validation
    if (!formData.password) {

      newErrors.password = "Password is required.";

    }
    else if (formData.password.length < 8) {

      newErrors.password =
        "Password must contain at least 8 characters.";

    }
    else if (!/[A-Z]/.test(formData.password)) {

      newErrors.password =
        "Password must contain at least one uppercase letter.";

    }
    else if (!/[a-z]/.test(formData.password)) {

      newErrors.password =
        "Password must contain at least one lowercase letter.";

    }
    else if (!/[0-9]/.test(formData.password)) {

      newErrors.password =
        "Password must contain at least one digit.";

    }
    else if (!/[!@#$%^&*]/.test(formData.password)) {

      newErrors.password =
        "Password must contain at least one special symbol.";

    }

    if (!formData.confirm_password) {

      newErrors.confirm_password =
        "Please confirm your password.";

    }
    else if (
      formData.password !== formData.confirm_password
    ) {

      newErrors.confirm_password =
        "Passwords do not match.";

    }

    if (!formData.role) {
      newErrors.role = "Please select a panel.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/register/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        const backendErrors = {};

        if (data.email) {
          backendErrors.email = data.email[0];
        }

        if (data.password) {
          backendErrors.password = data.password[0];
        }

        if (data.full_name) {
          backendErrors.full_name = data.full_name[0];
        }

        if (data.role) {
          backendErrors.role = data.role[0];
        }

        if (data.error) {
          backendErrors.general = data.error;
        }

        setErrors(backendErrors);

        return;
      }

      alert("Registration successful!");

      navigate("/login");

    }
    catch (error) {

      setErrors({
        general:
          "Unable to connect to the server. Please try again."
      });

    }
    finally {

      setLoading(false);

    }
  };


  return (
    <div className="auth-page">

      <div className="auth-card">

        <Link to="/" className="auth-logo">
          <span>ET</span>
          EventFlow
        </Link>


        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Join EventFlow and organize your work smarter.
        </p>


        {errors.general && (
          <div className="form-error general-error">
            {errors.general}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          {/* Full Name */}

          <div className="input-group">

            <label>Full name</label>

            <input
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />

            {errors.full_name && (
              <span className="field-error">
                {errors.full_name}
              </span>
            )}

          </div>


          {/* Email */}

          <div className="input-group">

            <label>Email address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {errors.email && (
              <span className="field-error">
                {errors.email}
              </span>
            )}

          </div>


          {/* Password */}

          <div className="input-group">

            <label>Password</label>

            <div className="password-wrapper">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "◉" : "👁"}
              </button>

            </div>

            {errors.password && (
              <span className="field-error">
                {errors.password}
              </span>
            )}

          </div>


          {/* Confirm Password */}

          <div className="input-group">

            <label>Confirm password</label>

            <div className="password-wrapper">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirm_password"
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? "◉" : "👁"}
              </button>

            </div>

            {errors.confirm_password && (
              <span className="field-error">
                {errors.confirm_password}
              </span>
            )}

          </div>


          {/* Panel */}

          <div className="input-group">

            <label>Panel</label>

            <div className="role-options">

              <label className="role-option">

                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === "user"}
                  onChange={handleChange}
                  required
                />

                <span>User</span>

              </label>


              <label className="role-option">

                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === "admin"}
                  onChange={handleChange}
                />

                <span>Admin</span>

              </label>

            </div>

            {errors.role && (
              <span className="field-error">
                {errors.role}
              </span>
            )}

          </div>


          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Creating Account..."
              : "Create Account"
            }

          </button>

        </form>


        <p className="auth-footer">

          Already have an account?

          <Link to="/login">
            {" "}Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;