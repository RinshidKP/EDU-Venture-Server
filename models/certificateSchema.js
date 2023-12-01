import mongoose from 'mongoose';

const { Schema } = mongoose;

const certificateSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student'}, 
  passport: {
    name: { type: String },
    passportNumber: { type: String },
    dateOfBirth: { type: Date },
    placeOfBirth: { type: String },
    dateOfIssue: { type: Date },
    dateOfExpiry: { type: Date },
    image_proof: {
      public_id: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
    },
  },
  qualification: {
    qualificationName: { type: String },
    universityName: { type: String },
    joinedDate: { type: Date },
    collegeName: { type: String },
    collegeAddress: { type: String },
    dateOfPassing: { type: Date },
    image_proof: {
      public_id: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
    },
  },
});

const Certificates = mongoose.model('Certificates', certificateSchema);

export default Certificates;
