import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  User, Student, Teacher, Admin, Category, Course, Chapter, Lesson, Quiz, Question, Answer, Badge, Setting, Assignment
} from '../models/index.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edukids';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Cleaning collections...');

    // Clear existing collections
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Admin.deleteMany();
    await Category.deleteMany();
    await Course.deleteMany();
    await Chapter.deleteMany();
    await Lesson.deleteMany();
    await Quiz.deleteMany();
    await Question.deleteMany();
    await Answer.deleteMany();
    await Badge.deleteMany();
    await Setting.deleteMany();

    console.log('Collections cleared. Generating global settings & default badges...');

    // 1. Create System settings
    await Setting.create({
      key: 'global_config',
      seoConfig: {
        title: 'EduKids - Học Vui Mỗi Ngày',
        metaDescription: 'Website giáo dục chất lượng cao, vui nhộn dành cho học sinh cấp 1.',
        keywords: 'học trực tuyến, toán lớp 1-5, tiếng việt, khoa học cấp 1'
      }
    });

    // 2. Create Badges
    const badgeChamp = await Badge.create({
      name: 'Ngôi Sao Siêu Cấp',
      description: 'Nhận được khi hoàn thành khóa học đầu tiên.',
      icon: '🏆',
      xpRequired: 100
    });

    const badgeStreak = await Badge.create({
      name: 'Nhà Giáo Dục Chăm Chỉ',
      description: 'Nhận được khi duy trì chuỗi điểm danh 3 ngày liên tiếp.',
      icon: '🌟',
      coinCost: 50
    });

    const badgeMax = await Badge.create({
      name: 'Học Thần Toàn Diện',
      description: 'Đạt điểm tối đa trong bài kiểm tra trắc nghiệm.',
      icon: '🥇',
      xpRequired: 200
    });

    console.log('Creating User accounts...');

    // 3. Create Users
    // Admin
    const userAdmin = await User.create({
      username: 'admin',
      email: 'admin@edukids.com',
      password: 'adminpassword', // Will be hashed by pre-save hook
      role: 'admin',
      fullName: 'Bác Quản Trị Viên'
    });
    await Admin.create({ user: userAdmin._id, permissions: ['all'] });

    // Teacher
    const userTeacher = await User.create({
      username: 'teacher',
      email: 'teacher@edukids.com',
      password: 'teacherpassword',
      role: 'teacher',
      fullName: 'Cô Giáo Mai Vy'
    });
    const teacherProfile = await Teacher.create({
      user: userTeacher._id,
      specialty: ['Toán học', 'Khoa học'],
      bio: 'Cô tốt nghiệp sư phạm tiểu học với 8 năm kinh nghiệm giảng dạy nhiệt huyết.'
    });

    // Student
    const userStudent = await User.create({
      username: 'student',
      email: 'student@edukids.com',
      password: 'studentpassword',
      role: 'student',
      fullName: 'Bé Minh Triết'
    });
    const studentProfile = await Student.create({
      user: userStudent._id,
      gradeLevel: 3,
      className: '3A1',
      xp: 150,
      coins: 80,
      level: 2,
      badges: [{ badge: badgeChamp._id }]
    });

    console.log('Creating subject Categories...');

    // 4. Create Categories
    const catMath = await Category.create({
      name: 'Toán học',
      slug: 'toan-hoc',
      description: 'Môn học phát triển tư duy logic và con số.',
      gradeLevel: 3
    });

    const catVietnamese = await Category.create({
      name: 'Tiếng Việt',
      slug: 'tieng-viet',
      description: 'Môn học ngôn ngữ, đọc viết và thơ ca Việt Nam.',
      gradeLevel: 3
    });

    console.log('Creating Courses, Chapters, and Lessons...');

    // 5. Create Course
    const courseMath = await Course.create({
      title: 'Toán Học Thú Vị Lớp 3',
      description: 'Hành trình khám phá các phép tính lý thú, các dạng toán đố hình học sinh động phù hợp với học sinh lớp 3.',
      instructor: userTeacher._id,
      category: catMath._id,
      gradeLevel: 3,
      isPublished: true,
      isApproved: true,
      xpReward: 100,
      coinReward: 40,
      enrollmentCount: 15
    });

    // 6. Create Chapter 1
    const chapter1 = await Chapter.create({
      course: courseMath._id,
      title: 'Chương 1: Phép Cộng và Phép Trừ Phạm Vi 1000',
      order: 1
    });

    // Lessons for Chapter 1
    const lesson1 = await Lesson.create({
      course: courseMath._id,
      chapter: chapter1._id,
      title: 'Bài 1: Ôn tập phép cộng và phép trừ phạm vi 1000',
      description: 'Học sinh ôn tập lại phép cộng trừ có nhớ và không nhớ trong phạm vi 1000 bằng phương pháp hình ảnh trực quan.',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Sample embedded video
      duration: 180,
      order: 1
    });

    const lesson2 = await Lesson.create({
      course: courseMath._id,
      chapter: chapter1._id,
      title: 'Bài 2: Thực hành giải toán có lời văn',
      description: 'Luyện tập phương pháp đọc đề, tóm tắt và thực hiện giải các bài toán có lời văn.',
      contentType: 'text',
      bodyText: 'Để giải bài toán có lời văn, các con làm theo 3 bước: \n1. Đọc kỹ đề bài để biết cái đã cho và cái cần hỏi.\n2. Tóm tắt đề bài bằng sơ đồ đoạn thẳng.\n3. Viết lời giải, phép tính và đáp số đầy đủ.\n\nVí dụ: Mẹ có 15 quả cam, mẹ cho bé 5 quả. Hỏi mẹ còn lại mấy quả?\nTóm tắt: \nMẹ có: 15 quả\nCho đi: 5 quả\nCòn lại: ... quả?\nLời giải:\nMẹ còn lại số quả cam là:\n15 - 5 = 10 (quả cam)\nĐáp số: 10 quả cam.',
      order: 2
    });

    console.log('Creating Quizzes, Questions, and Answers...');

    // 7. Create Quiz for Lesson 1
    const quiz1 = await Quiz.create({
      course: courseMath._id,
      chapter: chapter1._id,
      lesson: lesson1._id,
      title: 'Bài kiểm tra nhỏ: Ôn tập phép toán',
      description: 'Cùng bé thử sức ôn tập phép tính cộng trừ để nhận thưởng 50 XP nhé!',
      timeLimit: 10,
      passingScore: 50,
      showAnswersAfterSubmission: true
    });

    // Question 1: Single choice (Trắc nghiệm 1 đáp án)
    const q1 = await Question.create({
      quiz: quiz1._id,
      text: 'Mẹ có 150 quả táo, mẹ bán đi 50 quả. Hỏi mẹ còn bao nhiêu quả táo?',
      type: 'single',
      points: 10
    });
    await Answer.create([
      { question: q1._id, text: '80 quả', isCorrect: false },
      { question: q1._id, text: '100 quả', isCorrect: true },
      { question: q1._id, text: '120 quả', isCorrect: false },
      { question: q1._id, text: '200 quả', isCorrect: false }
    ]);

    // Question 2: Fill text (Điền đáp án)
    const q2 = await Question.create({
      quiz: quiz1._id,
      text: 'Kết quả của phép tính: 250 cộng 350 bằng bao nhiêu?',
      type: 'text',
      points: 10
    });
    await Answer.create({
      question: q2._id,
      text: '600',
      isCorrect: true
    });

    // Question 3: Matching (Ghép nối)
    const q3 = await Question.create({
      quiz: quiz1._id,
      text: 'Ghép các phép tính sau với kết quả tương ứng của chúng:',
      type: 'match',
      points: 20
    });
    await Answer.create([
      { question: q3._id, text: '100 - 40', matchingPair: '60', isCorrect: true },
      { question: q3._id, text: '20 + 30', matchingPair: '50', isCorrect: true },
      { question: q3._id, text: '90 - 10', matchingPair: '80', isCorrect: true }
    ]);

    console.log('Creating Assignments...');

    // 8. Create Assignment for course
    await Assignment.create({
      course: courseMath._id,
      chapter: chapter1._id,
      title: 'Bài tập về nhà: Cộng trừ phạm vi 1000',
      instructions: 'Các con hãy lấy vở tự học ra, chép lại đề và giải các phép tính sau:\n1. 423 + 256 = ?\n2. 985 - 342 = ?\nSau đó chụp ảnh vở viết và tải lên hệ thống để cô giáo chấm điểm nhé!',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      maxPoints: 10
    });

    console.log('Database seeding complete!');
    console.log(`=========================================`);
    console.log(`Default Accounts available:`);
    console.log(`1. Admin:   admin    / adminpassword`);
    console.log(`2. Teacher: teacher  / teacherpassword`);
    console.log(`3. Student: student  / studentpassword`);
    console.log(`=========================================`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding database failed:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
