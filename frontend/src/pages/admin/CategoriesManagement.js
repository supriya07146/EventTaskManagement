import React, {
  useEffect,
  useState
} from "react";

import {
  Search,
  X,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Tags,
  CalendarDays
} from "lucide-react";

import "./CategoriesManagement.css";


const CATEGORIES_API =
  "http://127.0.0.1:8000/api/categories/";


const emptyForm = {
  name: "",
  description: ""
};


function CategoriesManagement() {

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);


  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  // Add / Edit
  const [showModal, setShowModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [formError, setFormError] =
    useState("");

  const [formData, setFormData] =
    useState(emptyForm);


  // Delete
  const [deletingCategory, setDeletingCategory] =
    useState(null);


  // Search
  const [searchTerm, setSearchTerm] =
    useState("");


  // Pagination
  const [currentPage, setCurrentPage] =
    useState(1);

  const categoriesPerPage = 6;


  /*
  ========================================
  FETCH CATEGORIES
  ========================================
  */

  const fetchCategories = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "accessToken"
        );


      const params =
        new URLSearchParams();


      if (searchTerm.trim()) {

        params.append(
          "search",
          searchTerm.trim()
        );

      }


      const queryString =
        params.toString();


      const url =
        CATEGORIES_API +
        (
          queryString
            ? `?${queryString}`
            : ""
        );


      const response =
        await fetch(
          url,
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          data.error ||
          "Failed to load categories."
        );

      }


      setCategories(
        Array.isArray(data)
          ? data
          : data.categories || []
      );


      setCurrentPage(1);

    } catch (err) {

      console.error(
        "Fetch categories error:",
        err
      );

      setError(
        err.message ||
        "Unable to load categories."
      );

    } finally {

      setLoading(false);

    }

  };


  /*
  ========================================
  INITIAL LOAD
  ========================================
  */

  useEffect(() => {

    fetchCategories();

  }, [searchTerm]);


  /*
  ========================================
  FORM INPUT
  ========================================
  */

  const handleInputChange = (
    event
  ) => {

    const {
      name,
      value
    } = event.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value
      })
    );

  };


  /*
  ========================================
  OPEN ADD MODAL
  ========================================
  */

  const openAddModal = () => {

    setEditingCategory(null);

    setFormData({
      ...emptyForm
    });

    setFormError("");

    setShowModal(true);

  };


  /*
  ========================================
  OPEN EDIT MODAL
  ========================================
  */

  const openEditModal = (
    category
  ) => {

    setEditingCategory(category);

    setFormData({
      name:
        category.name || "",

      description:
        category.description || ""
    });

    setFormError("");

    setShowModal(true);

  };


  /*
  ========================================
  CLOSE MODAL
  ========================================
  */

  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingCategory(null);

    setFormData({
      ...emptyForm
    });

    setFormError("");

  };


  /*
  ========================================
  ADD / EDIT CATEGORY
  ========================================
  */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setFormError("");

    setError("");

    setSuccessMessage("");

    setSaving(true);


    try {

      const token =
        localStorage.getItem(
          "accessToken"
        );


      let url =
        CATEGORIES_API;

      let method =
        "POST";


      if (editingCategory) {

        url =
          `${CATEGORIES_API}${editingCategory.id}/`;

        method =
          "PUT";

      }


      const response =
        await fetch(
          url,
          {
            method,

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({

              name:
                formData.name.trim(),

              description:
                formData.description.trim()

            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        if (
          typeof data ===
          "object"
        ) {

          const firstError =
            Object.values(data)[0];


          if (
            Array.isArray(
              firstError
            )
          ) {

            throw new Error(
              firstError[0]
            );

          }


          if (
            typeof firstError ===
            "string"
          ) {

            throw new Error(
              firstError
            );

          }

        }


        throw new Error(
          data.detail ||
          data.error ||
          "Unable to save category."
        );

      }


      setShowModal(false);

      setEditingCategory(null);

      setFormData({
        ...emptyForm
      });


      setSuccessMessage(
        editingCategory
          ? "Category updated successfully."
          : "Category created successfully."
      );


      await fetchCategories();

    } catch (err) {

      console.error(
        "Save category error:",
        err
      );

      setFormError(
        err.message ||
        "Unable to save category."
      );

    } finally {

      setSaving(false);

    }

  };


  /*
  ========================================
  DELETE MODAL
  ========================================
  */

  const openDeleteModal = (
    category
  ) => {

    setDeletingCategory(
      category
    );

    setError("");

  };


  const closeDeleteModal = () => {

    if (deleteLoading) {
      return;
    }

    setDeletingCategory(null);

  };


  /*
  ========================================
  DELETE CATEGORY
  ========================================
  */

  const handleDeleteCategory =
    async () => {

      if (!deletingCategory) {
        return;
      }


      setDeleteLoading(true);


      try {

        const token =
          localStorage.getItem(
            "accessToken"
          );


        const response =
          await fetch(
            `${CATEGORIES_API}${deletingCategory.id}/`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        let data = {};

        try {

          data =
            await response.json();

        } catch {

          data = {};

        }


        if (!response.ok) {

          throw new Error(
            data.detail ||
            data.error ||
            "Unable to delete category."
          );

        }


        setDeletingCategory(
          null
        );


        setSuccessMessage(
          "Category deleted successfully."
        );


        await fetchCategories();

      } catch (err) {

        console.error(
          "Delete category error:",
          err
        );

        setError(
          err.message ||
          "Unable to delete category."
        );

        setDeletingCategory(
          null
        );

      } finally {

        setDeleteLoading(false);

      }

    };


  /*
  ========================================
  PAGINATION
  ========================================
  */

  const totalPages =
    Math.ceil(
      categories.length /
      categoriesPerPage
    );


  const startIndex =
    (currentPage - 1) *
    categoriesPerPage;


  const currentCategories =
    categories.slice(
      startIndex,
      startIndex +
        categoriesPerPage
    );


  /*
  ========================================
  RENDER
  ========================================
  */

  return (

    <div className="categories-management">


      {/* HEADER */}

      <div className="module-header">

        <div>

          <h1>
            Categories Management
          </h1>

          <p>
            Organize events and tasks
            using categories.
          </p>

        </div>

      </div>


      {/* SUCCESS */}

      {successMessage && (

        <div className="category-success-message">

          <span>
            {successMessage}
          </span>

          <button
            onClick={() =>
              setSuccessMessage("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* ERROR */}

      {error && (

        <div className="category-error-message">

          <span>
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* TOOLBAR */}

      <div className="categories-toolbar">


        {/* SEARCH */}

        <div className="categories-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />


          {searchTerm && (

            <button
              className="clear-category-search"
              onClick={() =>
                setSearchTerm("")
              }
            >
              <X size={15} />
            </button>

          )}

        </div>


        {/* REFRESH */}

        <button
          className="refresh-category-button"
          onClick={fetchCategories}
          title="Refresh categories"
        >
          <RefreshCw size={17} />
        </button>


        {/* ADD */}

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          <Plus size={16} />
          Add Category
        </button>

      </div>


      {/* RESULT COUNT */}

      {!loading && !error && (

        <div className="category-result-info">

          Showing{" "}

          <strong>
            {categories.length}
          </strong>{" "}

          categor
          {categories.length === 1
            ? "y"
            : "ies"}

        </div>

      )}


      {/* CATEGORY TABLE */}

      <div className="category-cards-area">


        {loading ? (

          <div className="cm-state">

            <div className="category-spinner"></div>

            <p>
              Loading categories...
            </p>

          </div>

        ) : categories.length === 0 ? (

          <div className="cm-state">

            <div className="cm-state-icon">
              <Tags size={28} />
            </div>

            <h3>
              No categories found
            </h3>

            <p>
              {searchTerm
                ? "Try a different search."
                : "Create your first category to get started."}
            </p>


            {!searchTerm && (

              <button
                className="primary-button"
                onClick={openAddModal}
              >
                <Plus size={16} />
                Add Category
              </button>

            )}

          </div>

        ) : (

          <>


            <div className="cm-grid">

              {currentCategories.map((category, index) => (

                <div
                  className="cm-card"
                  key={category.id}
                  style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                >

                  <div className={`cm-media grad-${(startIndex + index) % 3}`}>

                    <span className="cm-tag">
                      #{startIndex + index + 1}
                    </span>

                    <div className="cm-glyph">
                      <Tags size={30} />
                    </div>

                  </div>

                  <div className="cm-body">

                    <h3 title={category.name}>{category.name}</h3>

                    <p className="cm-sub">
                      {category.description || "No description added."}
                    </p>

                    <ul className="cm-meta">
                      <li>
                        <CalendarDays size={16} />
                        <span>
                          Created{" "}
                          {category.created_at
                            ? new Date(category.created_at).toLocaleDateString()
                            : "-"}
                        </span>
                      </li>
                    </ul>

                    <div className="cm-actions">

                      <button
                        className="cm-btn edit"
                        title="Edit category"
                        onClick={() => openEditModal(category)}
                      >
                        <Edit size={15} /> Edit
                      </button>

                      <button
                        className="cm-btn delete"
                        title="Delete category"
                        onClick={() => openDeleteModal(category)}
                      >
                        <Trash2 size={15} /> Delete
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (

              <div className="cm-pagination">

                <button
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      currentPage - 1
                    )
                  }
                >
                  Previous
                </button>


                <span>

                  Page{" "}

                  <strong>
                    {currentPage}
                  </strong>

                  {" "}of{" "}

                  <strong>
                    {totalPages}
                  </strong>

                </span>


                <button
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      currentPage + 1
                    )
                  }
                >
                  Next
                </button>

              </div>

            )}

          </>

        )}

      </div>


      {/* ==========================================
          ADD / EDIT MODAL
      ========================================== */}

      {showModal && (

        <div
          className="category-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeModal();

            }

          }}
        >

          <div className="category-modal">


            {/* HEADER */}

            <div className="category-modal-header">

              <div>

                <h2>

                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}

                </h2>

                <p>

                  {editingCategory
                    ? "Update category details."
                    : "Create a new category for events and tasks."}

                </p>

              </div>


              <button
                className="category-close-button"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
            >


              {formError && (

                <div className="category-form-error">
                  {formError}
                </div>

              )}


              <div className="category-form-group">

                <label>
                  Category Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter category name"
                  required
                  autoFocus
                />

              </div>


              <div className="category-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter category description..."
                  rows="4"
                />

              </div>


              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
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
                    : editingCategory
                      ? "Save Changes"
                      : "Create Category"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ==========================================
          DELETE CONFIRMATION
      ========================================== */}

      {deletingCategory && (

        <div className="category-modal-overlay">

          <div className="category-delete-modal">


            <div className="category-delete-icon">

              <Trash2 size={22} />

            </div>


            <h2>
              Delete Category?
            </h2>


            <p>

              Are you sure you want to
              delete{" "}

              <strong>
                {deletingCategory.name}
              </strong>

              ?

              <br />

              This action cannot be undone.

            </p>


            <div className="modal-actions">

              <button
                className="secondary-button"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  deleteLoading
                }
              >
                Cancel
              </button>


              <button
                className="delete-confirm-button"
                onClick={
                  handleDeleteCategory
                }
                disabled={
                  deleteLoading
                }
              >

                {deleteLoading
                  ? "Deleting..."
                  : "Delete Category"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default CategoriesManagement;