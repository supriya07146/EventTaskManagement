import React, { useEffect, useState } from "react";

import {
  UserCircle,
  Edit,
  Lock,
  Camera,
  LogOut,
  X,
  Save,
  Upload,
  Mail,
  ShieldCheck
} from "lucide-react";

import "../../styles/user/profile.css";

const API_URL = "http://127.0.0.1:8000/api";

function Profile() {

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const [fullName, setFullName] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");


  // =====================================================
  // GET PROFILE
  // =====================================================

  const fetchProfile = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/profile/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to load profile."
        );
      }

      setProfile(data);

      setFullName(
        data.full_name || ""
      );

      // Keep localStorage user updated
      const oldUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...data
        })
      );

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    fetchProfile();
  }, []);


  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const handleUpdateProfile = async (e) => {

    e.preventDefault();

    try {

      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/profile/`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            full_name: fullName
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to update profile."
        );

      }

      setProfile(data.user);

      const oldUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...data.user
        })
      );

      setMessage(
        "Profile updated successfully."
      );

      setShowEdit(false);

    } catch (err) {

      setError(err.message);

    }

  };


  // =====================================================
  // UPLOAD IMAGE
  // =====================================================

  const handleImageUpload = async (e) => {

    e.preventDefault();

    if (!selectedImage) {

      setError(
        "Please select an image."
      );

      return;

    }

    try {

      setError("");
      setMessage("");

      const formData = new FormData();

      formData.append(
        "profile_image",
        selectedImage
      );

      const response = await fetch(
        `${API_URL}/profile/upload-image/`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`
          },

          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Failed to upload image."
        );

      }

      setProfile((prev) => ({
        ...prev,
        profile_image:
          data.profile_image
      }));

      setMessage(
        "Profile image updated successfully."
      );

      setShowUpload(false);
      setSelectedImage(null);

      fetchProfile();

    } catch (err) {

      setError(err.message);

    }

  };


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async (e) => {

    e.preventDefault();

    try {

      setError("");
      setMessage("");

      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          "New passwords do not match."
        );

        return;

      }

      const response = await fetch(
        `${API_URL}/profile/change-password/`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            old_password:
              oldPassword,

            new_password:
              newPassword,

            confirm_password:
              confirmPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        const firstError =
          data.old_password?.[0] ||
          data.new_password?.[0] ||
          data.confirm_password?.[0] ||
          data.detail ||
          "Failed to change password.";

        throw new Error(firstError);

      }

      alert(
        "Password changed successfully. Please login again."
      );

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      window.location.href = "/login";

    } catch (err) {

      setError(err.message);

    }

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    localStorage.removeItem(
      "user"
    );

    window.location.href =
      "/login";

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="user-profile-page">

        <div className="profile-loading">

          <UserCircle size={28} />

          <p>
            Loading profile...
          </p>

        </div>

      </div>
    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (!profile) {

    return (
      <div className="user-profile-page">

        <div className="profile-error-box">

          <UserCircle size={30} />

          <h3>
            Unable to load profile
          </h3>

          <p>
            {error ||
              "Something went wrong."}
          </p>

          <button
            onClick={fetchProfile}
          >
            Try Again
          </button>

        </div>

      </div>
    );

  }


  const firstLetter =
    profile.full_name
      ? profile.full_name
          .charAt(0)
          .toUpperCase()
      : "U";


  return (

    <div className="user-profile-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="user-profile-header">

        <div>

          <div className="user-profile-title">

            <UserCircle size={23} />

            <h1>
              My Profile
            </h1>

          </div>

          <p>
            View and manage your personal account.
          </p>

        </div>


        <button
          className="user-logout-top"
          onClick={handleLogout}
        >

          <LogOut size={17} />

          Logout

        </button>

      </div>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {message && (

        <div className="user-profile-success">
          {message}
        </div>

      )}


      {error && (

        <div className="user-profile-error">
          {error}
        </div>

      )}


      {/* =================================================
          MAIN PROFILE
      ================================================= */}

      <div className="user-profile-layout">


        {/* =================================================
            LEFT CARD
        ================================================= */}

        <div className="user-profile-card">

          <div className="user-avatar-wrapper">

            {profile.profile_image ? (

              <img
                src={profile.profile_image}
                alt="Profile"
                className="user-profile-image"
              />

            ) : (

              <div className="user-large-avatar">
                {firstLetter}
              </div>

            )}


            <button
              className="user-camera-button"
              onClick={() => {

                setError("");
                setSelectedImage(null);
                setShowUpload(true);

              }}
              title="Upload image"
            >

              <Camera size={16} />

            </button>

          </div>


          <h2>
            {profile.full_name ||
              "User"}
          </h2>


          <span className="user-role-badge">

            {profile.role === "admin"
              ? "Administrator"
              : "User"}

          </span>


          <p className="user-email">

            <Mail size={14} />

            {profile.email}

          </p>


          <div className="account-status">

            <ShieldCheck size={15} />

            Active Account

          </div>


          <button
            className="user-logout-button"
            onClick={handleLogout}
          >

            <LogOut size={17} />

            Logout

          </button>

        </div>


        {/* =================================================
            RIGHT CARD
        ================================================= */}

        <div className="user-profile-details">


          <div className="user-details-header">

            <div>

              <h3>
                Profile Information
              </h3>

              <p>
                Your account details
              </p>

            </div>

          </div>


          <div className="user-detail-row">

            <span>
              Full Name
            </span>

            <strong>
              {profile.full_name ||
                "Not available"}
            </strong>

          </div>


          <div className="user-detail-row">

            <span>
              Email
            </span>

            <strong>
              {profile.email ||
                "Not available"}
            </strong>

          </div>


          <div className="user-detail-row">

            <span>
              Role
            </span>

            <strong>
              {profile.role === "admin"
                ? "Administrator"
                : "User"}
            </strong>

          </div>


          <div className="user-detail-row">

            <span>
              Account ID
            </span>

            <strong>
              #{profile.id}
            </strong>

          </div>


          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="user-profile-buttons">


            <button
              className="user-primary-button"
              onClick={() => {

                setError("");

                setFullName(
                  profile.full_name || ""
                );

                setShowEdit(true);

              }}
            >

              <Edit size={17} />

              Edit Profile

            </button>


            <button
              className="user-secondary-button"
              onClick={() => {

                setError("");

                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");

                setShowPassword(true);

              }}
            >

              <Lock size={17} />

              Change Password

            </button>


            <button
              className="user-secondary-button"
              onClick={() => {

                setError("");

                setSelectedImage(null);

                setShowUpload(true);

              }}
            >

              <Upload size={17} />

              Upload Image

            </button>

          </div>

        </div>

      </div>


      {/* =================================================
          EDIT PROFILE MODAL
      ================================================= */}

      {showEdit && (

        <div className="user-modal-overlay">

          <div className="user-modal">

            <div className="user-modal-header">

              <h3>
                Edit Profile
              </h3>

              <button
                onClick={() =>
                  setShowEdit(false)
                }
              >

                <X size={20} />

              </button>

            </div>


            <form
              onSubmit={
                handleUpdateProfile
              }
            >

              <label>
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                required
              />


              <label>
                Email
              </label>

              <input
                type="email"
                value={
                  profile.email || ""
                }
                disabled
              />


              <div className="user-modal-actions">

                <button
                  type="button"
                  className="user-cancel-button"
                  onClick={() =>
                    setShowEdit(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="user-save-button"
                >

                  <Save size={16} />

                  Save Changes

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          CHANGE PASSWORD MODAL
      ================================================= */}

      {showPassword && (

        <div className="user-modal-overlay">

          <div className="user-modal">

            <div className="user-modal-header">

              <h3>
                Change Password
              </h3>

              <button
                onClick={() =>
                  setShowPassword(false)
                }
              >

                <X size={20} />

              </button>

            </div>


            <form
              onSubmit={
                handleChangePassword
              }
            >

              <label>
                Current Password
              </label>

              <input
                type="password"
                value={oldPassword}
                onChange={(e) =>
                  setOldPassword(
                    e.target.value
                  )
                }
                required
              />


              <label>
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                required
                minLength={8}
              />


              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
                minLength={8}
              />


              <div className="user-modal-actions">

                <button
                  type="button"
                  className="user-cancel-button"
                  onClick={() =>
                    setShowPassword(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="user-save-button"
                >

                  <Lock size={16} />

                  Change Password

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          UPLOAD IMAGE MODAL
      ================================================= */}

      {showUpload && (

        <div className="user-modal-overlay">

          <div className="user-modal">

            <div className="user-modal-header">

              <h3>
                Upload Profile Image
              </h3>

              <button
                onClick={() =>
                  setShowUpload(false)
                }
              >

                <X size={20} />

              </button>

            </div>


            <form
              onSubmit={
                handleImageUpload
              }
            >

              <div className="user-upload-area">

                <Camera size={35} />

                <p>
                  Select a profile image
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedImage(
                      e.target.files[0]
                    )
                  }
                />


                {selectedImage && (

                  <span>
                    {selectedImage.name}
                  </span>

                )}

              </div>


              <div className="user-modal-actions">

                <button
                  type="button"
                  className="user-cancel-button"
                  onClick={() =>
                    setShowUpload(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="user-save-button"
                >

                  <Upload size={16} />

                  Upload

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}

export default Profile;