import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  header: {
    type: String,
    required: true,
  },
  course_image: {
    type: String,
  },
  short_blob: {
    type: String,
  },
  students_qualification_header: {
    type: String,
  },
  qualification_description: {
    type: String,
  },
  requirements_header: {
    type: String,
  },
  requirements_blob: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  fee: {
    type: Number,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId, 
    // ref: 'Country',
    required: true,
  },
  creator_id: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
  },
  students: {
    type: [mongoose.Schema.Types.ObjectId],
  },
});

const CourseModel = mongoose.model('Course', courseSchema);

export default CourseModel;
