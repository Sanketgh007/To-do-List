import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Todo() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [todos, setTodos] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const apiUrl = "http://localhost:8000/api";

    useEffect(() => {
        if (user) getItems();
    }, [user]);

    const getItems = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const res = await fetch(`${apiUrl}/todos`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to fetch todos");
            }

            const data = await res.json();
            setTodos(data);
        } catch (err) {
            console.error("Fetch todos error:", err);
            setError("Error fetching todos. Please try again.");
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            setError("Title and description are required");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const res = await fetch(`${apiUrl}/todos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create todo");
            }

            const newTodo = await res.json();
            setTodos((prevTodos) => [...prevTodos, newTodo]);
            setTitle("");
            setDescription("");
            setMessage("Item Added Successfully");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Create todo error:", err);
            setError(`Unable to create Todo item: ${err.message}`);
        }
    };

    const handleEdit = (item) => {
        setEditId(item._id);
        setEditTitle(item.title);
        setEditDescription(item.description);
    };

    const handleUpdate = async () => {
        if (!editTitle.trim() || !editDescription.trim()) {
            setError("Title and description are required");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const res = await fetch(`${apiUrl}/todos/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: editTitle, description: editDescription }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update todo");
            }

            setTodos((prevTodos) =>
                prevTodos.map((item) =>
                    item._id === editId ? { ...item, title: editTitle, description: editDescription } : item
                )
            );

            setEditId(null);
            setEditTitle("");
            setEditDescription("");
            setMessage("Item updated successfully");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Update todo error:", err);
            setError(`Unable to update Todo item: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete?")) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const res = await fetch(`${apiUrl}/todos/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete todo");
            }

            setTodos((prevTodos) => prevTodos.filter((item) => item._id !== id));
            setMessage("Item deleted successfully");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Delete todo error:", err);
            setError(`Unable to delete Todo item: ${err.message}`);
        }
    };

    const handleEditCancel = () => {
        setEditId(null);
        setEditTitle("");
        setEditDescription("");
        setError("");
    };

    return (
        <>
            <div className="row p-3 bg-success text-light">
                <div className="d-flex justify-content-between align-items-center">
                    <h1>TODO Project with MERN Stack</h1>
                    <div>
                        <span className="me-3">Welcome, {user?.name}</span>
                        <button
                            className="btn btn-light"
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="row p-3">
                <h3>Add Item</h3>
                {message && <p className="text-success">{message}</p>}
                {error && <p className="text-danger">{error}</p>}
                <div className="form-group d-flex gap-2">
                    <input
                        placeholder="Title"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        className="form-control"
                        type="text"
                    />
                    <input
                        placeholder="Description"
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                        className="form-control"
                        type="text"
                    />
                    <button className="btn btn-dark" onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </div>

            <div className="row p-3">
                <h3>Tasks</h3>
                <ul className="list-group">
                    {todos.map((item) => (
                        <li key={item._id} className="list-group-item bg-info d-flex justify-content-between align-items-center my-2">
                            <div className="d-flex flex-column me-2">
                                {editId === item._id ? (
                                    <div className="form-group d-flex gap-2">
                                        <input
                                            placeholder="Title"
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            value={editTitle}
                                            className="form-control"
                                            type="text"
                                        />
                                        <input
                                            placeholder="Description"
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            value={editDescription}
                                            className="form-control"
                                            type="text"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <span className="fw-bold">{item.title}</span>
                                        <span>{item.description}</span>
                                    </>
                                )}
                            </div>
                            <div className="d-flex gap-2">
                                {editId === item._id ? (
                                    <>
                                        <button className="btn btn-success" onClick={handleUpdate}>
                                            Update
                                        </button>
                                        <button className="btn btn-danger" onClick={handleEditCancel}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-warning" onClick={() => handleEdit(item)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}