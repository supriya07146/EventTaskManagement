import React, { useEffect, useState } from "react";

import "./EventManagement.css";

const API = "http://127.0.0.1:8000/api/events/";
const MAX_IMAGE_MB = 5;

const EMPTY_FORM = {
    title: "",
    description: "",
    location: "",
    event_date: "",
    start_time: "",
    end_time: "",
    capacity: 100,
    status: "upcoming"
};

const trimTime = (t) => (t ? t.slice(0, 5) : "");


/* small inline icons (no extra package needed) */
const Icon = ({ d, children }) => (
    <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
    >
        {d ? <path d={d} /> : children}
    </svg>
);

const PinIcon = () => (
    <Icon><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Icon>
);
const CalendarIcon = () => (
    <Icon><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Icon>
);
const ClockIcon = () => (
    <Icon><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Icon>
);
const SeatsIcon = () => (
    <Icon>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
);


function EventsManagement() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState(EMPTY_FORM);

    // image upload state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const token = localStorage.getItem("accessToken");


    /* ---------------- FETCH ---------------- */

    const fetchEvents = async () => {

        setLoading(true);

        try {

            const params = new URLSearchParams();

            if (search.trim()) params.append("search", search.trim());
            if (statusFilter) params.append("status", statusFilter);

            const url = params.toString() ? `${API}?${params}` : API;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Unable to load events.");
                return;
            }

            setError("");
            setEvents(Array.isArray(data) ? data : data.events || []);

        } catch (err) {

            setError("Unable to connect to server.");

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter]);

    // free the temporary preview URL when it changes / unmounts
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);


    /* ---------------- FORM HELPERS ---------------- */

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {

        const file = e.target.files && e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFormError("Please choose an image file (JPG, PNG, WEBP).");
            e.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            setFormError(`Image must be smaller than ${MAX_IMAGE_MB} MB.`);
            e.target.value = "";
            return;
        }

        setFormError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearNewImage = () => {
        setImageFile(null);
        // fall back to the saved image (edit mode) or nothing (create mode)
        setImagePreview(editingEvent && editingEvent.image ? editingEvent.image : "");
    };

    const openCreateForm = () => {
        setEditingEvent(null);
        setFormData(EMPTY_FORM);
        setImageFile(null);
        setImagePreview("");
        setFormError("");
        setShowForm(true);
    };

    const openEditForm = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description || "",
            location: event.location,
            event_date: event.event_date,
            start_time: event.start_time,
            end_time: event.end_time,
            capacity: event.capacity,
            status: event.status
        });
        setImageFile(null);
        setImagePreview(event.image || "");
        setFormError("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEvent(null);
        setImageFile(null);
        setImagePreview("");
        setFormError("");
    };


    /* ---------------- SAVE ---------------- */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setFormError("");
        setSaving(true);

        try {

            // multipart so the image file can travel with the fields
            const body = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                body.append(key, value);
            });

            if (imageFile) {
                body.append("image", imageFile);
            }

            const url = editingEvent ? `${API}${editingEvent.id}/` : API;

            const response = await fetch(url, {
                method: editingEvent ? "PUT" : "POST",
                // NOTE: do NOT set Content-Type here, the browser adds
                // the multipart boundary automatically.
                headers: { Authorization: `Bearer ${token}` },
                body
            });

            const data = await response.json();

            if (!response.ok) {
                const firstError = Object.values(data)[0];
                setFormError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : firstError || "Unable to save event."
                );
                return;
            }

            closeForm();
            fetchEvents();

        } catch (err) {

            setFormError("Unable to connect to server.");

        } finally {

            setSaving(false);

        }
    };


    /* ---------------- DELETE ---------------- */

    const handleDelete = async (id) => {

        if (!window.confirm("Are you sure you want to delete this event?")) {
            return;
        }

        try {

            const response = await fetch(`${API}${id}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Unable to delete event.");
                return;
            }

            setError("");
            fetchEvents();

        } catch (err) {

            setError("Unable to connect to server.");

        }
    };


    /* ---------------- RENDER ---------------- */

    return (

        <div className="module-page events-management">

            <div className="module-header">

                <div>
                    <h1>Events Management</h1>
                    <p>Create and manage your events.</p>
                </div>

                <button className="primary-button" onClick={openCreateForm}>
                    + Create Event
                </button>

            </div>


            {error && <div className="module-error">{error}</div>}


            <div className="module-toolbar">

                <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

            </div>


            {loading ? (

                <div className="loading">Loading events...</div>

            ) : events.length === 0 ? (

                <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>No events found</h3>
                    <p>Create your first event to get started.</p>
                    <button className="primary-button" onClick={openCreateForm}>
                        Create Event
                    </button>
                </div>

            ) : (

                <div className="events-grid">

                    {events.map((event, index) => (

                        <div
                            className="event-card"
                            key={event.id}
                            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                        >

                            {/* ---------- image / gradient header ---------- */}
                            <div className={`event-card-media grad-${index % 3}`}>

                                {event.image ? (
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        loading="lazy"
                                    />
                                ) : (
                                    <span className="event-card-placeholder">
                                        <svg
                                            width="64" height="64" viewBox="0 0 24 24"
                                            fill="currentColor" aria-hidden="true"
                                        >
                                            <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 9H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8ZM8 13h2v2H8v-2Zm3 0h2v2h-2v-2Zm3 0h2v2h-2v-2Z" />
                                        </svg>
                                    </span>
                                )}

                                <span className={`event-badge ${event.status}`}>
                                    {event.status}
                                </span>

                            </div>

                            {/* ---------- body ---------- */}
                            <div className="event-card-body">

                                <h3 title={event.title}>{event.title}</h3>

                                <p className="event-card-desc">
                                    {event.description || "No description added."}
                                </p>

                                <ul className="event-card-meta">
                                    <li><PinIcon /><span>{event.location}</span></li>
                                    <li><CalendarIcon /><span>{event.event_date}</span></li>
                                    <li>
                                        <ClockIcon />
                                        <span>
                                            {trimTime(event.start_time)} - {trimTime(event.end_time)}
                                        </span>
                                    </li>
                                    <li><SeatsIcon /><span>{event.capacity} seats</span></li>
                                </ul>

                                <div className="action-buttons">

                                    <button
                                        className="edit-button"
                                        onClick={() => openEditForm(event)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(event.id)}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}


            {showForm && (

                <div className="modal-overlay">

                    <div className="event-modal">

                        <div className="modal-header">

                            <div>
                                <h2>{editingEvent ? "Edit Event" : "Create Event"}</h2>
                                <p>Enter event details below.</p>
                            </div>

                            <button
                                type="button"
                                className="close-button"
                                onClick={closeForm}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleSubmit}>

                            {formError && (
                                <div className="module-error">{formError}</div>
                            )}

                            <div className="form-grid">

                                {/* ---------- image upload ---------- */}
                                <div className="form-group full">

                                    <label>Event Image</label>

                                    <div className="image-upload">

                                        <div className={`image-preview ${imagePreview ? "has-image" : ""}`}>
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Event preview" />
                                            ) : (
                                                <span>No image selected</span>
                                            )}
                                        </div>

                                        <div className="image-upload-actions">

                                            <label className="upload-button">
                                                {imagePreview ? "Change Image" : "Choose Image"}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    hidden
                                                />
                                            </label>

                                            {imageFile && (
                                                <button
                                                    type="button"
                                                    className="upload-clear"
                                                    onClick={clearNewImage}
                                                >
                                                    Undo
                                                </button>
                                            )}

                                            <small>JPG, PNG or WEBP, up to {MAX_IMAGE_MB} MB.</small>

                                        </div>

                                    </div>

                                </div>


                                <div className="form-group full">
                                    <label>Event Title</label>
                                    <input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter event title"
                                        required
                                    />
                                </div>

                                <div className="form-group full">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Enter event description"
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group full">
                                    <label>Location</label>
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Enter event location"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Event Date</label>
                                    <input
                                        type="date"
                                        name="event_date"
                                        value={formData.event_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Capacity</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        min="1"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Time</label>
                                    <input
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                            </div>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingEvent
                                            ? "Update Event"
                                            : "Create Event"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}


export default EventsManagement;