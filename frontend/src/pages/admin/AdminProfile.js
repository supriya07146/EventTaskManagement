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
} from "lucide-react";
import "./AdminProfile.css";

const API_URL = "http://127.0.0.1:8000/api";

function AdminProfile() {
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

  // ===============================
  // GET PROFILE
  // ===============================
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load profile.");
      }

      setProfile(data);
      setFullName(data.full_name || "");

      const oldUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...data,
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

  // ===============================
  // UPDATE PROFILE
  // ===============================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/profile/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update profile."
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
          ...data.user,
        })
      );

      setMessage("Profile updated successfully.");
      setShowEdit(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // ===============================
  // UPLOAD IMAGE
  // ===============================
  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      setError("Please select an image.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("profile_image", selectedImage);

      const response = await fetch(
        `${API_URL}/profile/upload-image/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to upload image."
        );
      }

      setProfile((prev) => ({
        ...prev,
        profile_image: data.profile_image,
      }));

      setMessage("Profile image updated successfully.");
      setShowUpload(false);
      setSelectedImage(null);

      fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  // ===============================
  // CHANGE PASSWORD
  // ===============================
  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }

      const response = await fetch(
        `${API_URL}/profile/change-password/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
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

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      window.location.href = "/login";
    } catch (err) {
      setError(err.message);
    }
  };

  // ===============================
  // LOGOUT
  // ===============================
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <div className="admin-profile-page">
        <div className="profile-page-header">
          <div>
            <div className="profile-title">
              <UserCircle size={23} />
              <h1>Admin Profile</h1>
            </div>

            <p>
              View and manage your administrator profile.
            </p>
          </div>
        </div>

        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  // ===============================
  // ERROR / NO PROFILE
  // ===============================
  if (!profile) {
    return (
      <div className="admin-profile-page">
        <div className="profile-page-header">
          <div>
            <div className="profile-title">
              <UserCircle size={23} />
              <h1>Admin Profile</h1>
            </div>

            <p>
              View and manage your administrator profile.
            </p>
          </div>
        </div>

        <div className="profile-error">
          {error || "Unable to load profile."}
        </div>
      </div>
    );
  }

  const firstLetter = profile.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : "A";

  return (
    <div className="admin-profile-page">

      {/* ================= HEADER ================= */}

      <div className="profile-page-header">
        <div>
          <div className="profile-title">
            <UserCircle size={23} />
            <h1>Admin Profile</h1>
          </div>

          <p>
            View and manage your administrator profile.
          </p>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}

      {message && (
        <div className="profile-success">
          {message}
        </div>
      )}

      {error && (
        <div className="profile-error">
          {error}
        </div>
      )}

      {/* ================= PROFILE CONTENT ================= */}

      <div className="profile-layout">

        {/* LEFT CARD */}

        <div className="profile-card">

          <div className="profile-avatar-wrapper">

            {profile.profile_image ? (
              <img
                src={profile.profile_image}
                alt="Profile"
                className="large-avatar-image"
              />
            ) : (
              <div className="large-avatar">
                {firstLetter}
              </div>
            )}

            <button
              type="button"
              className="camera-button"
              onClick={() => {
                setError("");
                setShowUpload(true);
              }}
            >
              <Camera size={17} />
            </button>

          </div>

          <h2>
            {profile.full_name || "Administrator"}
          </h2>

          <span className="admin-badge">
            {profile.role === "admin"
              ? "Administrator"
              : profile.role}
          </span>

          <p>{profile.email}</p>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

        {/* RIGHT CARD */}

        <div className="profile-details">

          <div className="profile-details-header">
            <div>
              <h3>Profile Information</h3>
              <p>Your account details</p>
            </div>
          </div>

          <div className="detail-row">
            <span>Full Name</span>
            <strong>
              {profile.full_name || "Not available"}
            </strong>
          </div>

          <div className="detail-row">
            <span>Email</span>
            <strong>
              {profile.email || "Not available"}
            </strong>
          </div>

          <div className="detail-row">
            <span>Role</span>
            <strong>
              {profile.role === "admin"
                ? "Administrator"
                : profile.role}
            </strong>
          </div>

          <div className="detail-row">
            <span>Account ID</span>
            <strong>
              #{profile.id}
            </strong>
          </div>

          {/* BUTTONS */}

          <div className="profile-buttons">

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setError("");
                setFullName(profile.full_name || "");
                setShowEdit(true);
              }}
            >
              <Edit size={17} />
              Edit Profile
            </button>

            <button
              type="button"
              className="secondary-button"
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
              type="button"
              className="secondary-button"
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

      {/* ================= EDIT PROFILE MODAL ================= */}

      {showEdit && (
        <div className="profile-modal-overlay">

          <div className="profile-modal">

            <div className="modal-header">

              <h3>Edit Profile</h3>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowEdit(false)}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleUpdateProfile}>

              <label>Full Name</label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                required
              />

              <label>Email</label>

              <input
                type="email"
                value={profile.email || ""}
                disabled
              />

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  <Save size={16} />
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================= CHANGE PASSWORD MODAL ================= */}

      {showPassword && (
        <div className="profile-modal-overlay">

          <div className="profile-modal">

            <div className="modal-header">

              <h3>Change Password</h3>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowPassword(false)}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleChangePassword}>

              <label>Current Password</label>

              <input
                type="password"
                value={oldPassword}
                onChange={(e) =>
                  setOldPassword(e.target.value)
                }
                required
              />

              <label>New Password</label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                required
                minLength={8}
              />

              <label>Confirm New Password</label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
                minLength={8}
              />

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowPassword(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  <Lock size={16} />
                  Change Password
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================= UPLOAD IMAGE MODAL ================= */}

      {showUpload && (
        <div className="profile-modal-overlay">

          <div className="profile-modal">

            <div className="modal-header">

              <h3>Upload Profile Image</h3>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowUpload(false)}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleImageUpload}>

              <div className="upload-area">

                <Camera size={35} />

                <p>Select a profile image</p>

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
                  <span className="selected-file">
                    {selectedImage.name}
                  </span>
                )}

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
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

export default AdminProfile;