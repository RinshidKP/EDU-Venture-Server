import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema({
  image: {
    public_id: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: String,
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const Country = mongoose.model('Country', countrySchema);

export default Country;
