import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global_config',
  },
  logoUrl: {
    type: String,
    default: '',
  },
  faviconUrl: {
    type: String,
    default: '',
  },
  smtpSettings: {
    host: { type: String, default: '' },
    port: { type: Number, default: 587 },
    user: { type: String, default: '' },
    pass: { type: String, default: '' },
    sender: { type: String, default: '' }
  },
  seoConfig: {
    title: { type: String, default: 'EduKids - Học Vui Mỗi Ngày' },
    metaDescription: { type: String, default: 'Hệ thống học tập trực tuyến sinh động dành cho học sinh tiểu học.' },
    keywords: { type: String, default: 'học tiểu học, học trực tuyến, toán cấp 1' }
  },
  theme: {
    primaryColor: { type: String, default: '#0ea5e9' },
    darkModeDefault: { type: Boolean, default: false }
  }
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
