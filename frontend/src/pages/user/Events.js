import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/user/events.css";

import {
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaArrowLeft,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaShieldAlt
} from "react-icons/fa";


const API_URL = "http://127.0.0.1:8000";


const Events = () => {

  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Registration popup
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);

  // Registration details
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // OTP
  const [verificationId, setVerificationId] = useState(null);
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [registrationError, setRegistrationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  /* =====================================================
     GET EVENTS
  ===================================================== */

  useEffect(() => {
    fetchEvents();
  }, []);


  const fetchEvents = async () => {

    try {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/api/events/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load events.");
      }

      const data = await response.json();

      const eventList =
        Array.isArray(data)
          ? data
          : data.results || [];

      setEvents(eventList);
      setFilteredEvents(eventList);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to load events. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  useEffect(() => {

    let result = [...events];

    if (search.trim() !== "") {

      const value = search.toLowerCase();

      result = result.filter((event) => {

        return (
          event.title?.toLowerCase().includes(value) ||
          event.name?.toLowerCase().includes(value) ||
          event.description?.toLowerCase().includes(value) ||
          event.location?.toLowerCase().includes(value)
        );

      });

    }

    if (statusFilter !== "All") {

      result = result.filter(
        (event) =>
          event.status?.toLowerCase() ===
          statusFilter.toLowerCase()
      );

    }

    setFilteredEvents(result);

  }, [search, statusFilter, events]);


  /* =====================================================
     OPEN REGISTRATION
  ===================================================== */

  const handleRegister = (event) => {

    const user =
      JSON.parse(localStorage.getItem("user")) || {};

    setSelectedEvent(event);

    setRegistrationData({
      name:
        user.full_name ||
        user.name ||
        user.username ||
        "",

      email:
        user.email ||
        "",

      phone:
        user.phone ||
        ""
    });

    setRegistrationError("");
    setSuccessMessage("");

    setOtp("");
    setOtpSent(false);
    setVerificationId(null);

    setShowRegistration(true);
  };


  /* =====================================================
     CLOSE REGISTRATION
  ===================================================== */

  const closeRegistration = () => {

    if (sendingOtp || verifyingOtp) {
      return;
    }

    setShowRegistration(false);
    setSelectedEvent(null);
    setOtp("");
    setOtpSent(false);
    setVerificationId(null);
    setRegistrationError("");
    setSuccessMessage("");

  };


  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setRegistrationData((previous) => ({
      ...previous,
      [name]: value
    }));

  };


  /* =====================================================
     SEND OTP
  ===================================================== */

  const handleSendOTP = async (e) => {

    e.preventDefault();

    setRegistrationError("");
    setSuccessMessage("");

    if (!registrationData.name.trim()) {

      setRegistrationError(
        "Please enter your name."
      );

      return;
    }

    if (!registrationData.email.trim()) {

      setRegistrationError(
        "Please enter your email."
      );

      return;
    }

    if (!registrationData.phone.trim()) {

      setRegistrationError(
        "Please enter your phone number."
      );

      return;
    }

    if (registrationData.phone.trim().length < 10) {

      setRegistrationError(
        "Please enter a valid phone number."
      );

      return;
    }

    try {

      setSendingOtp(true);

      const token =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/api/registrations/request-otp/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            event: selectedEvent.id,
            name: registrationData.name,
            email: registrationData.email,
            phone: registrationData.phone
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setRegistrationError(
          data.error ||
          data.detail ||
          "Unable to send OTP."
        );

        return;
      }

      setVerificationId(
        data.verification_id
      );

      setOtpSent(true);

      setSuccessMessage(
        "OTP has been sent to your email."
      );

    } catch (err) {

      console.error(err);

      setRegistrationError(
        "Something went wrong while sending OTP."
      );

    } finally {

      setSendingOtp(false);

    }

  };


  /* =====================================================
     VERIFY OTP
  ===================================================== */

  const handleVerifyOTP = async (e) => {

    e.preventDefault();

    setRegistrationError("");
    setSuccessMessage("");

    if (!otp.trim()) {

      setRegistrationError(
        "Please enter the OTP."
      );

      return;
    }

    if (otp.trim().length !== 6) {

      setRegistrationError(
        "OTP must contain 6 digits."
      );

      return;
    }

    try {

      setVerifyingOtp(true);

      const token =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/api/registrations/verify-otp/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            verification_id: verificationId,
            otp: otp
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setRegistrationError(
          data.error ||
          data.detail ||
          "Invalid OTP."
        );

        return;
      }

      setSuccessMessage(
        "Successfully registered for the event!"
      );

      setTimeout(() => {

        closeRegistration();

      }, 1500);

    } catch (err) {

      console.error(err);

      setRegistrationError(
        "Something went wrong while verifying OTP."
      );

    } finally {

      setVerifyingOtp(false);

    }

  };


  /* =====================================================
     EVENT STATUS
  ===================================================== */

  const getStatus = (event) => {

    if (event.status) {
      return event.status;
    }

    return "Upcoming";

  };


  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <div className="events-page">


      {/* ================= HEADER ================= */}

      {/* ================= HEADER ================= */}

<div className="events-header">

  <div className="events-heading">

    <div className="events-page-icon">
      <FaCalendarAlt />
    </div>

    <div>
      <h1>Events</h1>
      <p>Browse and register for upcoming events</p>
    </div>

  </div>

  <button
    className="events-back-btn"
    onClick={() => navigate("/dashboard")}
  >
    <FaArrowLeft />
    <span>Dashboard</span>
  </button>

</div>


{/* ================= CONTENT ================= */}

<section className="events-content">

        {/* ================= SEARCH / FILTER ================= */}

        <div className="events-toolbar">

          <div className="events-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <div className="events-filter">

            <FaFilter />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >

              <option value="All">
                All Events
              </option>

              <option value="Upcoming">
                Upcoming
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

            </select>

          </div>

        </div>


        {/* ================= ERROR ================= */}

        {error && (

          <div className="events-error">
            {error}
          </div>

        )}


        {/* ================= LOADING ================= */}

        {loading ? (

          <div className="events-loading">

            <div className="events-spinner"></div>

            <p>
              Loading events...
            </p>

          </div>


        ) : filteredEvents.length === 0 ? (

          <div className="events-empty">

            <FaCalendarAlt />

            <h3>
              No events found
            </h3>

            <p>
              There are currently no events matching
              your search.
            </p>

          </div>


        ) : (

          <div className="events-grid">

            {filteredEvents.map((event) => (

              <div
                className="event-card"
                key={event.id}
              >

                <div className="event-image">

                  {event.image ? (

                    <img
                      src={
                        event.image.startsWith("http")
                          ? event.image
                          : `${API_URL}${event.image}`
                      }
                      alt={
                        event.title ||
                        event.name
                      }
                    />

                  ) : (

                    <FaCalendarAlt />

                  )}


                  <span
                    className={`event-status ${
                      getStatus(event)
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                    }`}
                  >
                    {getStatus(event)}
                  </span>

                </div>


                <div className="event-body">

                  <h3>
                    {event.title ||
                      event.name ||
                      "Untitled Event"}
                  </h3>


                  <p className="event-description">

                    {event.description ||
                      "No description available for this event."}

                  </p>


                  <div className="event-details">

                    {event.location && (

                      <div>

                        <FaMapMarkerAlt />

                        <span>
                          {event.location}
                        </span>

                      </div>

                    )}


                    {(event.date ||
                      event.event_date ||
                      event.start_date) && (

                      <div>

                        <FaCalendarAlt />

                        <span>
                          {
                            event.date ||
                            event.event_date ||
                            event.start_date
                          }
                        </span>

                      </div>

                    )}


                    {(event.time ||
                      event.event_time ||
                      event.start_time) && (

                      <div>

                        <FaClock />

                        <span>
                          {
                            event.time ||
                            event.event_time ||
                            event.start_time
                          }
                        </span>

                      </div>

                    )}


                    {event.capacity && (

                      <div>

                        <FaUsers />

                        <span>
                          {event.capacity} seats
                        </span>

                      </div>

                    )}

                  </div>


                  <button
                    className="event-register-btn"
                    onClick={() =>
                      handleRegister(event)
                    }
                  >
                    Register for Event
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          REGISTRATION MODAL
      ===================================================== */}

      {showRegistration && selectedEvent && (

        <div
          className="registration-modal-overlay"
          onClick={closeRegistration}
        >

          <div
            className="registration-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="registration-modal-header">

              <div>

                <div className="registration-modal-icon">
                  <FaCalendarAlt />
                </div>

                <div>

                  <h2>
                    {otpSent
                      ? "Verify Your Email"
                      : "Event Registration"}
                  </h2>

                  <p>
                    {selectedEvent.title}
                  </p>

                </div>

              </div>


              <button
                className="registration-close-btn"
                onClick={closeRegistration}
              >
                <FaTimes />
              </button>

            </div>


            {/* EVENT INFO */}

            <div className="registration-event-info">

              <div>
                <FaCalendarAlt />
                <span>
                  {selectedEvent.event_date ||
                    selectedEvent.date ||
                    "Event date"}
                </span>
              </div>

              <div>
                <FaMapMarkerAlt />
                <span>
                  {selectedEvent.location ||
                    "Event location"}
                </span>
              </div>

            </div>


            {!otpSent ? (

              /* ================= DETAILS FORM ================= */

              <form
                className="registration-form"
                onSubmit={handleSendOTP}
              >

                <div className="registration-form-title">

                  <h3>
                    Enter your details
                  </h3>

                  <p>
                    We will send a confirmation OTP to your email.
                  </p>

                </div>


                <label>
                  <span>
                    <FaUser />
                    Full Name
                  </span>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={registrationData.name}
                    onChange={handleInputChange}
                  />

                </label>


                <label>
                  <span>
                    <FaEnvelope />
                    Email Address
                  </span>

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={registrationData.email}
                    onChange={handleInputChange}
                  />

                </label>


                <label>
                  <span>
                    <FaPhone />
                    Phone Number
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={registrationData.phone}
                    onChange={handleInputChange}
                  />

                </label>


                {registrationError && (

                  <div className="registration-form-error">
                    {registrationError}
                  </div>

                )}


                {successMessage && (

                  <div className="registration-form-success">
                    {successMessage}
                  </div>

                )}


                <button
                  type="submit"
                  className="registration-submit-btn"
                  disabled={sendingOtp}
                >

                  {sendingOtp
                    ? "Sending OTP..."
                    : "Continue & Send OTP"}

                </button>

              </form>

            ) : (

              /* ================= OTP FORM ================= */

              <form
                className="registration-form"
                onSubmit={handleVerifyOTP}
              >

                <div className="otp-section">

                  <div className="otp-icon">
                    <FaShieldAlt />
                  </div>

                  <h3>
                    Enter Confirmation OTP
                  </h3>

                  <p>
                    We sent a 6-digit OTP to
                  </p>

                  <strong>
                    {registrationData.email}
                  </strong>

                </div>


                <label>

                  <span>
                    <FaShieldAlt />
                    Confirmation OTP
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />

                </label>


                {registrationError && (

                  <div className="registration-form-error">
                    {registrationError}
                  </div>

                )}


                {successMessage && (

                  <div className="registration-form-success">
                    {successMessage}
                  </div>

                )}


                <button
                  type="submit"
                  className="registration-submit-btn"
                  disabled={verifyingOtp}
                >

                  {verifyingOtp
                    ? "Verifying..."
                    : "Verify & Register"}

                </button>


                <button
                  type="button"
                  className="change-details-btn"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setRegistrationError("");
                    setSuccessMessage("");
                  }}
                >
                  Change Details
                </button>

              </form>

            )}

          </div>

        </div>

      )}

    </div>

  );

};


export default Events;