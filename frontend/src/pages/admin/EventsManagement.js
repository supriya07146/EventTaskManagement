import React, { useEffect, useState } from "react";

import "./EventManagement.css";


function EventsManagement() {

    const [events, setEvents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);

    const [editingEvent, setEditingEvent] = useState(null);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        event_date: "",
        start_time: "",
        end_time: "",
        capacity: 100,
        status: "upcoming"
    });


    const token = localStorage.getItem(
        "accessToken"
    );


    const fetchEvents = async () => {

        setLoading(true);

        try {

            let url =
                "http://127.0.0.1:8000/api/events/";

            const params = new URLSearchParams();

            if (search.trim()) {
                params.append(
                    "search",
                    search.trim()
                );
            }

            if (statusFilter) {
                params.append(
                    "status",
                    statusFilter
                );
            }

            if (params.toString()) {
                url += "?" + params.toString();
            }


            const response = await fetch(
                url,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data = await response.json();


            if (!response.ok) {

                setError(
                    data.error ||
                    "Unable to load events."
                );

                return;
            }


            setEvents(
                Array.isArray(data) ? data : data.events || []
            );

        }
        catch (error) {

            setError(
                "Unable to connect to server."
            );

        }
        finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchEvents();

    }, [search, statusFilter]);


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]:
                e.target.value
        });

    };


    const openCreateForm = () => {

        setEditingEvent(null);

        setFormData({
            title: "",
            description: "",
            location: "",
            event_date: "",
            start_time: "",
            end_time: "",
            capacity: 100,
            status: "upcoming"
        });

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

        setShowForm(true);

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        try {

            const url = editingEvent

                ? `http://127.0.0.1:8000/api/events/${editingEvent.id}/`

                : "http://127.0.0.1:8000/api/events/";


            const response = await fetch(
                url,
                {
                    method:
                        editingEvent
                            ? "PUT"
                            : "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify(
                        formData
                    )
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                const firstError =
                    Object.values(data)[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : firstError ||
                        "Unable to save event."
                );

                return;
            }


            alert(
                editingEvent
                    ? "Event updated successfully."
                    : "Event created successfully."
            );


            setShowForm(false);

            setEditingEvent(null);

            fetchEvents();

        }
        catch (error) {

            setError(
                "Unable to connect to server."
            );

        }

    };


    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this event?"
            );


        if (!confirmDelete) {
            return;
        }


        try {

            const response =
                await fetch(
                    `http://127.0.0.1:8000/api/events/${id}/`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                setError(
                    data.error ||
                    "Unable to delete event."
                );

                return;
            }


            alert(
                "Event deleted successfully."
            );


            fetchEvents();

        }
        catch (error) {

            setError(
                "Unable to connect to server."
            );

        }

    };


    return (

        <div className="module-page">

            <div className="module-header">

                <div>

                    <h1>
                        Events Management
                    </h1>

                    <p>
                        Create and manage your events.
                    </p>

                </div>


                <button
                    className="primary-button"
                    onClick={openCreateForm}
                >
                    + Create Event
                </button>

            </div>


            {error && (

                <div className="module-error">
                    {error}
                </div>

            )}


            <div className="module-toolbar">

                <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />


                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        All Status
                    </option>

                    <option value="upcoming">
                        Upcoming
                    </option>

                    <option value="ongoing">
                        Ongoing
                    </option>

                    <option value="completed">
                        Completed
                    </option>

                    <option value="cancelled">
                        Cancelled
                    </option>

                </select>

            </div>


            {loading ? (

                <div className="loading">
                    Loading events...
                </div>

            ) : events.length === 0 ? (

                <div className="empty-state">

                    <div className="empty-icon">
                        📅
                    </div>

                    <h3>
                        No events found
                    </h3>

                    <p>
                        Create your first event
                        to get started.
                    </p>

                    <button
                        className="primary-button"
                        onClick={openCreateForm}
                    >
                        Create Event
                    </button>

                </div>

            ) : (

                <div className="table-card">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Event
                                </th>

                                <th>
                                    Location
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Time
                                </th>

                                <th>
                                    Capacity
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {events.map(
                                (event) => (

                                    <tr
                                        key={
                                            event.id
                                        }
                                    >

                                        <td>

                                            <strong>
                                                {
                                                    event.title
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    event.description
                                                }
                                            </small>

                                        </td>


                                        <td>
                                            {
                                                event.location
                                            }
                                        </td>


                                        <td>
                                            {
                                                event.event_date
                                            }
                                        </td>


                                        <td>
                                            {
                                                event.start_time
                                            }
                                            {" - "}
                                            {
                                                event.end_time
                                            }
                                        </td>


                                        <td>
                                            {
                                                event.capacity
                                            }
                                        </td>


                                        <td>

                                            <span
                                                className={`status-badge ${event.status}`}
                                            >
                                                {
                                                    event.status
                                                }
                                            </span>

                                        </td>


                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        openEditForm(
                                                            event
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            event.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}


            {showForm && (

                <div className="modal-overlay">

                    <div className="event-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {editingEvent
                                        ? "Edit Event"
                                        : "Create Event"}
                                </h2>

                                <p>
                                    Enter event details below.
                                </p>

                            </div>


                            <button
                                className="close-button"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="form-grid">

                                <div className="form-group full">

                                    <label>
                                        Event Title
                                    </label>

                                    <input
                                        name="title"
                                        value={
                                            formData.title
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter event title"
                                        required
                                    />

                                </div>


                                <div className="form-group full">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter event description"
                                        rows="4"
                                    />

                                </div>


                                <div className="form-group full">

                                    <label>
                                        Location
                                    </label>

                                    <input
                                        name="location"
                                        value={
                                            formData.location
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter event location"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Event Date
                                    </label>

                                    <input
                                        type="date"
                                        name="event_date"
                                        value={
                                            formData.event_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Capacity
                                    </label>

                                    <input
                                        type="number"
                                        name="capacity"
                                        min="1"
                                        value={
                                            formData.capacity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Start Time
                                    </label>

                                    <input
                                        type="time"
                                        name="start_time"
                                        value={
                                            formData.start_time
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        End Time
                                    </label>

                                    <input
                                        type="time"
                                        name="end_time"
                                        value={
                                            formData.end_time
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            formData.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="upcoming">
                                            Upcoming
                                        </option>

                                        <option value="ongoing">
                                            Ongoing
                                        </option>

                                        <option value="completed">
                                            Completed
                                        </option>

                                        <option value="cancelled">
                                            Cancelled
                                        </option>

                                    </select>

                                </div>

                            </div>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="primary-button"
                                >
                                    {editingEvent
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