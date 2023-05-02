const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({ 
  message: {
    type: String,
    required: true
  },
  length: Number,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
