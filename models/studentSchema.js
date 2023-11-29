import mongoose from "mongoose";

const {Schema , model} = mongoose;

const studentSchema = new Schema({
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profile_picture: {
        public_id: {
            type: String,
            default: '',
          },
          url: {
            type: String,
            default: '',
          },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    bio: {
        type: String,
    },
    age: {
        type: Number,
    },
    rewards: {
        type: [],
    },
    blog: {
        type: String,
    },
    courses: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Course',
        },
    ],
    qualification: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    role: {
        type: String,
        default:'student'
    }
});

const StudentModel = model('student',studentSchema);

export default StudentModel ;