import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const consultancySchema = new Schema({
    consultancy_name: {
        type: String,
        required: true,
        minlength: 3,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    profile_image: {
        public_id: {
            type: String,
            default: '',
          },
          url: {
            type: String,
            default: '',
          },
    },
    password: {
        type: String,
        required: true,
    },    
    title: {
        type: String,
        minlength: 3,
    },
    description: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        default:'consultant'
    }
});

const Consultancy = model('Consultancy', consultancySchema);

export default Consultancy;
