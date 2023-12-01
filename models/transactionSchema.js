import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  transactionId: {
    type: String,
    unique:true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultant',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
  },
  isSuccess : {
    type:Boolean,
    default: false
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
