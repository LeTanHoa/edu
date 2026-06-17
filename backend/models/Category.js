import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  gradeLevel: {
    type: Number, // Class 1, 2, 3, 4, 5
    required: true,
  }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
