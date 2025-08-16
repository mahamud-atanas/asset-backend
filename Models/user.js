const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    lastname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 10,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    role: {
        type: String,
        enum: ['admin', 'superadmin', 'user'],  // Allowed roles
        default: 'user'  // Default role if not specified
    }
});

// Generate JWT including role
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { _id: this._id, role: this.role },
        config.get('jwtPrivateKey'),
        { expiresIn: '1h' } // Token expiry time
    );
    return token;
}

const User = mongoose.model('User', userSchema);

// Validation function for user input
function validateUser(user) {
    const schema = Joi.object({
        firstname: Joi.string().min(2).max(50).required(),
        lastname: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(10).required().email(),
        password: Joi.string().min(5).max(1024).required(),
        role: Joi.string().valid('admin', 'superadmin', 'user').default('user')
    });

    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
