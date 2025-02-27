const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {  // New field added
        type: String,
        required: false, // Optional field
        default: ''
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Use this pattern to prevent model recompilation
module.exports = mongoose.models.Todo || mongoose.model('Todo', todoSchema);
