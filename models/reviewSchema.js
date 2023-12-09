import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'student',
    required: true,
  },
  course_id: {
    type: Schema.Types.ObjectId,
    ref: 'course',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
