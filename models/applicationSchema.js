import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  paymentStatus: { 
    type: String,
    enum: ['Pending','Initiated', 'Paid', 'Failed'],
    default: 'Pending',
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  additionalNotes: {
    type: String,
  },
  
});

const ApplicationModel = mongoose.model('Application', applicationSchema);

export default ApplicationModel;
