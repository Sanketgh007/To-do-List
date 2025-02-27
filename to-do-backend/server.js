require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mern-app")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Move Todo Schema and Model to separate file
const Todo = require('./models/Todo');

// Routes
app.use("/api/auth", authRoutes);

// Todo Routes with Authentication
app.post("/api/todos", authMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }

        const newTodo = new Todo({ 
            title, 
            description, 
            userId: req.user.userId 
        });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        console.error("Error in POST /todos:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/todos", authMiddleware, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user.userId }).sort({ title: 1 });
        res.json(todos);
    } catch (error) {
        console.error("Error in GET /todos:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put("/api/todos/:id", authMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { title, description },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.json(updatedTodo);
    } catch (error) {
        console.error("Error in PUT /todos:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/api/todos/:id", authMiddleware, async (req, res) => {
    try {
        const deletedTodo = await Todo.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.userId 
        });
        
        if (!deletedTodo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.json({ message: "Todo deleted successfully" });
    } catch (error) {
        console.error("Error in DELETE /todos:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});