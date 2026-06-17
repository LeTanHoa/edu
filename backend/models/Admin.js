import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  permissions: {
    type: [String], // e.g., ["manage_users", "manage_settings", "manage_content"]
    default: ["all"],
  }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
