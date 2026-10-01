import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../styles/auth.css";

function VerifyOTP() {

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    if (!email) {
      setError("Email information is missing.");
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must contain exactly 6 digits.");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/verify-otp/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: email,
            otp: otp
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.error ||
          "Invalid OTP."
        );

        return;
      }

      navigate("/reset-password", {
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


        <h1>Verify OTP</h1>

        <p className="auth-subtitle">

          Enter the 6-digit OTP sent to your email address.

        </p>


        {email && (

          <p
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#64748b",
              marginBottom: "20px"
            }}
          >
            OTP sent to <strong>{email}</strong>
          </p>

        )}


        {error && (

          <div className="form-error general-error">

            {error}

          </div>

        )}


        <form onSubmit={handleSubmit}>

          <div className="input-group">

            <label>Enter OTP</label>

            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {

                const value =
                  e.target.value.replace(/\D/g, "");

                setOtp(value);
                setError("");

              }}
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
              ? "Verifying..."
              : "Verify OTP"
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

export default VerifyOTP;