import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "../styles/auth.css";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user"
  });

  const [showPassword, setShowPassword] = useState(false);

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


    if (!formData.email.trim()) {

      newErrors.email = "Email is required.";

    }
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {

      newErrors.email = "Enter a valid email address.";

    }


    if (!formData.password) {

      newErrors.password = "Password is required.";

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
        "http://127.0.0.1:8000/api/login/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: formData.role
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        setErrors({
          general:
            data.error ||
            "Invalid email or password."
        });

        return;
      }


      // Store JWT tokens

      localStorage.setItem(
        "accessToken",
        data.accessToken
      );

      localStorage.setItem(
        "refreshToken",
        data.refreshToken
      );


      // Store logged-in user

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );


      alert("Login successful!");


      // Navigate according to panel

      if (data.user.role === "admin") {

        navigate("/admin");

      }
      else {

        navigate("/dashboard");

      }

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


        <h1>Welcome back</h1>

        <p className="auth-subtitle">

          Sign in to continue managing your events and tasks.

        </p>


        {errors.general && (

          <div className="form-error general-error">

            {errors.general}

          </div>

        )}


        <form onSubmit={handleSubmit}>


          {/* Email */}

          <div className="input-group">

            <label>Email address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
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
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
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


          {/* Forgot Password */}

          <div className="forgot-password">

            <Link to="/forgot-password">

              Forgot Password?click here

            </Link>

          </div>
         

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Signing in..."
              : "Login"
            }

          </button>

        </form>


        <p className="auth-footer">

          Don't have an account?

          <Link to="/register">

            {" "}Create one

          </Link>

        </p>


      </div>

    </div>

  );

}

export default Login;