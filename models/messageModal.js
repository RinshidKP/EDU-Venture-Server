import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    index:true,
    default: Date.now,
  },
  type : {
    type :Number
  },
});

messageSchema.index({ sender: 1, receiver: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
