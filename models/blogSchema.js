import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const blogSchema = new Schema({
  heading: {
    type: String,
    required: true,
    unique:true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'student',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Blog = model('Blog', blogSchema);

export default Blog;
