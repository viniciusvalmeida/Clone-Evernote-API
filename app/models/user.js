const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre('save', function (next){
    const document = this
    if (this.isNew || this.isModified('password')) {
        bcrypt.hash(document.password, 10, (err, hashedPassword) => {
            if (err) {
                next(err)
            } else {
                this.password = hashedPassword
                next()
            }
        })
    } 
})

module.exports = mongoose.model("User", userSchema);
