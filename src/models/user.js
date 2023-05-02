const mongoose = require('mongoose');
var validator = require('validator');

const userSchema = new mongoose.Schema({ 
  name: {
    type: String,
    required: true
  },
  age: Number,
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      return validator.isEmail(value);
    }
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;