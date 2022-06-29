const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    title: String,
    body: String,
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
});

module.exports = mongoose.model("Note", noteSchema);
