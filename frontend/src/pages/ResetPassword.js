import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../styles/auth.css";

function ResetPassword() {

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  const validatePassword = () => {

    if (!newPassword) {

      return "Password is required.";

    }

    if (newPassword.length < 8) {

      return "Password must contain at least 8 characters.";

    }

    if (!/[A-Z]/.test(newPassword)) {

      return "Password must contain at least one uppercase letter.";

    }

    if (!/[a-z]/.test(newPassword)) {

      return "Password must contain at least one lowercase letter.";

    }

    if (!/[0-9]/.test(newPassword)) {

      return "Password must contain at least one digit.";

    }

    if (!/[!@#$%^&*]/.test(newPassword)) {

      return "Password must contain at least one special symbol.";

    }

    if (newPassword !== confirmPassword) {

      return "Passwords do not match.";

    }

    return "";

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    const passwordError = validatePassword();

    if (passwordError) {

      setError(passwordError);

      return;

    }

    if (!email) {

      setError("Email information is missing.");

      return;

    }

    setLoading(true);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/reset-password/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: email,
            new_password: newPassword,
            confirm_password: confirmPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.error ||
          "Unable to reset password."
        );

        return;
      }

      alert(
        "Password reset successfully. Please login."
      );

      navigate("/login");

    }
    catch (error) {

      setError(
        "Unable to connect to the server. Please try again."
      );

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


        <h1>Create New Password</h1>

        <p className="auth-subtitle">

          Create a new secure password for your account.

        </p>


        {error && (

          <div className="form-error general-error">

            {error}

          </div>

        )}


        <form onSubmit={handleSubmit}>


          {/* New Password */}

          <div className="input-group">

            <label>New password</label>

            <div className="password-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create new password"
                value={newPassword}
                onChange={(e) => {

                  setNewPassword(e.target.value);
                  setError("");

                }}
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

          </div>


          {/* Confirm Password */}

          <div className="input-group">

            <label>Confirm new password</label>

            <div className="password-wrapper">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {

                  setConfirmPassword(e.target.value);
                  setError("");

                }}
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

          </div>


          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Updating Password..."
              : "Reset Password"
            }

          </button>

        </form>


        <p className="auth-footer">

          Remember your password?

          <Link to="/login">
            {" "}Back to Login
          </Link>

        </p>

      </div>

    </div>

  );

}

export default ResetPassword;