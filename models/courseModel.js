import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  header: {
    type: String,
    required: true,
  },
  course_image: {
    public_id: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
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
    default: true,
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
    required: true,
    ref:'Country',
  },
  creator_id: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref:'Consultancy',
  },
  students: {
    type: [mongoose.Schema.Types.ObjectId],
  },
});

const CourseModel = mongoose.model('Course', courseSchema);

export default CourseModel;
