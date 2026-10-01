import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/auth.css";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    if (!email.trim()) {

      setError("Email is required.");

      return;
    }


    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

      setError("Enter a valid email address.");

      return;
    }


    setLoading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/forgot-password/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: email
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        setError(
          data.error ||
          "Unable to send OTP."
        );

        return;
      }


      alert("OTP has been sent to your email.");


      navigate("/verify-otp", {
        state: {
          email: email
        }
      });


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


        <h1>Forgot Password?</h1>


        <p className="auth-subtitle">

          Enter your registered email address and
          we'll send you a verification OTP.

        </p>


        {error && (

          <div className="form-error general-error">

            {error}

          </div>

        )}


        <form onSubmit={handleSubmit}>


          <div className="input-group">

            <label>Email address</label>

            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />

            {error && (

              <span className="field-error">

                {error}

              </span>

            )}

          </div>


          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Sending OTP..."
              : "Send OTP"
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

export default ForgotPassword;