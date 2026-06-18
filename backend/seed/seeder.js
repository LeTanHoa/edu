import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  User, Student, Teacher, Admin, Category, Course, Chapter, Lesson, Quiz, Question, Answer, Badge, Setting, Assignment,
  Submission, Enrollment, Grade, Notification, Comment, Message, Achievement, Certificate, Banner, Log, ParentFeedback
} from '../models/index.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edukids';

const addDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const courseSeeds = [
  {
    gradeLevel: 1,
    subject: 'math',
    title: 'Toán Lớp 1: Làm Quen Với Số Đếm',
    description: 'Bé học đếm số, so sánh nhiều hơn ít hơn và thực hành cộng trừ trong phạm vi 10.',
    chapterTitle: 'Chương 1: Các số từ 0 đến 10',
    lessons: [
      ['Đếm số bằng hình ảnh', 'Nhận biết số lượng qua đồ vật quen thuộc trong lớp học.'],
      ['Cộng trừ đơn giản', 'Thực hành các phép tính trong phạm vi 10 bằng que tính.']
    ],
    assignmentTitle: 'Phiếu luyện tập số đếm lớp 1',
    assignmentInstructions: 'Viết các số từ 0 đến 10, khoanh nhóm có nhiều đồ vật hơn và làm 5 phép cộng trừ trong phạm vi 10.'
  },
  {
    gradeLevel: 1,
    subject: 'vietnamese',
    title: 'Tiếng Việt Lớp 1: Vần Và Tiếng Đầu Tiên',
    description: 'Khóa học giúp bé nhận biết âm, vần, ghép tiếng và đọc các câu ngắn đầu tiên.',
    chapterTitle: 'Chương 1: Âm, vần và tiếng',
    lessons: [
      ['Nhận diện âm đầu', 'Luyện nghe và đọc các âm đầu thường gặp.'],
      ['Ghép vần thành tiếng', 'Ghép âm và vần để tạo tiếng có nghĩa.']
    ],
    assignmentTitle: 'Bài tập ghép vần lớp 1',
    assignmentInstructions: 'Ghép 10 tiếng từ các âm và vần đã học, sau đó đọc thành tiếng cho phụ huynh nghe.'
  },
  {
    gradeLevel: 1,
    subject: 'science',
    title: 'Tự Nhiên Xã Hội Lớp 1: Cơ Thể Của Em',
    description: 'Bé tìm hiểu các bộ phận cơ thể, giác quan và thói quen chăm sóc bản thân.',
    chapterTitle: 'Chương 1: Em chăm sóc cơ thể',
    lessons: [
      ['Năm giác quan', 'Tìm hiểu mắt, tai, mũi, lưỡi và da giúp em khám phá thế giới.'],
      ['Giữ gìn vệ sinh cá nhân', 'Học cách rửa tay, đánh răng và giữ cơ thể sạch sẽ.']
    ],
    assignmentTitle: 'Nhật ký vệ sinh cá nhân',
    assignmentInstructions: 'Đánh dấu các việc em đã làm trong 3 ngày: rửa tay, đánh răng, chải tóc và uống nước.'
  },
  {
    gradeLevel: 2,
    subject: 'math',
    title: 'Toán Lớp 2: Cộng Trừ Có Nhớ',
    description: 'Bé luyện cộng trừ hai chữ số, đặt tính thẳng hàng và giải toán có lời văn ngắn.',
    chapterTitle: 'Chương 1: Cộng trừ trong phạm vi 100',
    lessons: [
      ['Đặt tính rồi tính', 'Ôn cách đặt hàng chục, hàng đơn vị đúng vị trí.'],
      ['Giải toán có lời văn', 'Tập đọc đề, tìm dữ kiện và viết đáp số.']
    ],
    assignmentTitle: 'Bài tập cộng trừ có nhớ lớp 2',
    assignmentInstructions: 'Hoàn thành 12 phép tính cộng trừ có nhớ và 2 bài toán có lời văn trong vở.'
  },
  {
    gradeLevel: 2,
    subject: 'vietnamese',
    title: 'Tiếng Việt Lớp 2: Đọc Hiểu Truyện Ngắn',
    description: 'Bé rèn đọc trôi chảy, tìm ý chính và trả lời câu hỏi từ các truyện ngắn gần gũi.',
    chapterTitle: 'Chương 1: Đọc hiểu câu chuyện',
    lessons: [
      ['Đọc đúng và ngắt nghỉ', 'Luyện đọc câu dài với dấu phẩy, dấu chấm.'],
      ['Tìm nhân vật và sự việc', 'Xác định ai làm gì trong câu chuyện.']
    ],
    assignmentTitle: 'Phiếu đọc hiểu truyện ngắn',
    assignmentInstructions: 'Đọc đoạn truyện trong bài, trả lời 5 câu hỏi và viết 2 câu nêu cảm nghĩ.'
  },
  {
    gradeLevel: 2,
    subject: 'science',
    title: 'Tự Nhiên Xã Hội Lớp 2: Gia Đình Và Nhà Trường',
    description: 'Bé học về thành viên gia đình, công việc trong trường và cách ứng xử an toàn.',
    chapterTitle: 'Chương 1: Môi trường quanh em',
    lessons: [
      ['Gia đình của em', 'Nhận biết vai trò của từng thành viên trong gia đình.'],
      ['An toàn ở trường', 'Ghi nhớ các quy tắc khi học tập và vui chơi ở trường.']
    ],
    assignmentTitle: 'Sơ đồ gia đình của em',
    assignmentInstructions: 'Vẽ sơ đồ gia đình, ghi tên từng thành viên và một việc em có thể giúp ở nhà.'
  },
  {
    gradeLevel: 3,
    subject: 'math',
    title: 'Toán Lớp 3: Nhân Chia Cơ Bản',
    description: 'Bé nắm bảng nhân chia, thực hành tính nhẩm và vận dụng vào bài toán thực tế.',
    chapterTitle: 'Chương 1: Bảng nhân và bảng chia',
    lessons: [
      ['Bảng nhân 2, 3, 4, 5', 'Tìm quy luật trong bảng nhân để ghi nhớ nhanh hơn.'],
      ['Chia đều thành các nhóm', 'Hiểu phép chia qua hoạt động chia đồ vật.']
    ],
    assignmentTitle: 'Bài tập bảng nhân chia lớp 3',
    assignmentInstructions: 'Làm 20 phép nhân chia cơ bản và viết một bài toán thực tế dùng phép chia.'
  },
  {
    gradeLevel: 3,
    subject: 'vietnamese',
    title: 'Tiếng Việt Lớp 3: Luyện Viết Đoạn Văn',
    description: 'Bé học cách lập ý, viết câu chủ đề và hoàn thiện đoạn văn ngắn rõ ràng.',
    chapterTitle: 'Chương 1: Viết đoạn văn miêu tả',
    lessons: [
      ['Câu chủ đề là gì?', 'Nhận biết câu mở đầu nêu ý chính của đoạn văn.'],
      ['Thêm chi tiết miêu tả', 'Dùng từ chỉ màu sắc, hình dáng và cảm xúc để đoạn văn sinh động.']
    ],
    assignmentTitle: 'Viết đoạn văn tả đồ vật',
    assignmentInstructions: 'Viết đoạn văn 5 đến 7 câu tả một đồ vật em yêu thích, có câu mở đoạn và kết đoạn.'
  },
  {
    gradeLevel: 3,
    subject: 'science',
    title: 'Khoa Học Lớp 3: Thực Vật Quanh Em',
    description: 'Bé khám phá rễ, thân, lá, hoa và điều kiện giúp cây phát triển khỏe mạnh.',
    chapterTitle: 'Chương 1: Cây xanh và đời sống',
    lessons: [
      ['Các bộ phận của cây', 'Quan sát và gọi tên rễ, thân, lá, hoa, quả.'],
      ['Cây cần gì để sống?', 'Tìm hiểu vai trò của nước, ánh sáng, không khí và đất.']
    ],
    assignmentTitle: 'Quan sát một cây xanh',
    assignmentInstructions: 'Chọn một cây ở nhà hoặc trường, vẽ lại cây và ghi 4 điều kiện giúp cây sống tốt.'
  },
  {
    gradeLevel: 4,
    subject: 'math',
    title: 'Toán Lớp 4: Phân Số Dễ Hiểu',
    description: 'Bé làm quen tử số, mẫu số, so sánh phân số và thực hành rút gọn đơn giản.',
    chapterTitle: 'Chương 1: Làm quen với phân số',
    lessons: [
      ['Tử số và mẫu số', 'Hiểu phân số qua hình tròn, thanh bánh và đoạn thẳng.'],
      ['So sánh phân số cùng mẫu', 'Nhận biết phân số lớn hơn, bé hơn khi cùng mẫu số.']
    ],
    assignmentTitle: 'Phiếu phân số lớp 4',
    assignmentInstructions: 'Tô màu hình theo phân số, so sánh 8 cặp phân số cùng mẫu và rút gọn 4 phân số.'
  },
  {
    gradeLevel: 4,
    subject: 'vietnamese',
    title: 'Tiếng Việt Lớp 4: Mở Rộng Vốn Từ',
    description: 'Bé luyện từ đồng nghĩa, trái nghĩa, đặt câu và dùng từ chính xác trong văn nói, văn viết.',
    chapterTitle: 'Chương 1: Từ ngữ và câu',
    lessons: [
      ['Từ đồng nghĩa và trái nghĩa', 'Phân biệt các cặp từ có nghĩa giống và nghĩa đối lập.'],
      ['Đặt câu giàu hình ảnh', 'Dùng từ gợi tả để câu văn rõ ý và sinh động hơn.']
    ],
    assignmentTitle: 'Bài tập vốn từ lớp 4',
    assignmentInstructions: 'Tìm 5 cặp từ trái nghĩa, 5 nhóm từ đồng nghĩa và đặt 6 câu với các từ vừa tìm.'
  },
  {
    gradeLevel: 4,
    subject: 'science',
    title: 'Khoa Học Lớp 4: Nước Và Không Khí',
    description: 'Bé tìm hiểu tính chất của nước, vòng tuần hoàn nước và vai trò của không khí sạch.',
    chapterTitle: 'Chương 1: Nước trong đời sống',
    lessons: [
      ['Ba thể của nước', 'Quan sát nước ở thể rắn, lỏng và hơi.'],
      ['Bảo vệ nguồn nước', 'Nhận biết việc nên làm để giữ nguồn nước sạch.']
    ],
    assignmentTitle: 'Poster bảo vệ nguồn nước',
    assignmentInstructions: 'Thiết kế một poster nhỏ kêu gọi tiết kiệm nước và ghi 3 hành động em sẽ thực hiện.'
  },
  {
    gradeLevel: 5,
    subject: 'math',
    title: 'Toán Lớp 5: Số Thập Phân Và Tỉ Số',
    description: 'Bé ôn số thập phân, phép tính với số thập phân và bài toán tỉ số phần trăm cơ bản.',
    chapterTitle: 'Chương 1: Số thập phân',
    lessons: [
      ['Đọc viết số thập phân', 'Nhận biết phần nguyên, phần thập phân và hàng phần mười, phần trăm.'],
      ['Tính với số thập phân', 'Thực hành cộng trừ số thập phân trong tình huống mua bán.']
    ],
    assignmentTitle: 'Bài tập số thập phân lớp 5',
    assignmentInstructions: 'Hoàn thành 10 phép tính số thập phân và 3 bài toán ứng dụng tỉ số phần trăm.'
  },
  {
    gradeLevel: 5,
    subject: 'vietnamese',
    title: 'Tiếng Việt Lớp 5: Tập Làm Văn Miêu Tả',
    description: 'Bé luyện quan sát, lập dàn ý và viết bài văn miêu tả người, cảnh, sự vật.',
    chapterTitle: 'Chương 1: Lập dàn ý bài văn',
    lessons: [
      ['Quan sát và ghi ý', 'Chọn chi tiết tiêu biểu trước khi viết bài.'],
      ['Mở bài, thân bài, kết bài', 'Sắp xếp ý thành bố cục rõ ràng, mạch lạc.']
    ],
    assignmentTitle: 'Dàn ý bài văn tả cảnh',
    assignmentInstructions: 'Lập dàn ý chi tiết cho bài văn tả một cảnh đẹp em từng thấy, tối thiểu 3 ý chính.'
  },
  {
    gradeLevel: 5,
    subject: 'science',
    title: 'Khoa Học Lớp 5: Hệ Mặt Trời',
    description: 'Bé khám phá Mặt Trời, Trái Đất, Mặt Trăng và chuyển động của các hành tinh.',
    chapterTitle: 'Chương 1: Trái Đất trong không gian',
    lessons: [
      ['Mặt Trời và các hành tinh', 'Nhận biết vị trí các hành tinh trong hệ Mặt Trời.'],
      ['Ngày, đêm và mùa', 'Hiểu vì sao có ngày đêm và các mùa trong năm.']
    ],
    assignmentTitle: 'Mô hình hệ Mặt Trời mini',
    assignmentInstructions: 'Vẽ sơ đồ hệ Mặt Trời, ghi tên 8 hành tinh và viết 3 điều thú vị em học được.'
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Cleaning collections...');

    await Promise.all([
      User.deleteMany(),
      Student.deleteMany(),
      Teacher.deleteMany(),
      Admin.deleteMany(),
      Category.deleteMany(),
      Course.deleteMany(),
      Chapter.deleteMany(),
      Lesson.deleteMany(),
      Quiz.deleteMany(),
      Question.deleteMany(),
      Answer.deleteMany(),
      Badge.deleteMany(),
      Setting.deleteMany(),
      Assignment.deleteMany(),
      Submission.deleteMany(),
      Enrollment.deleteMany(),
      Grade.deleteMany(),
      Notification.deleteMany(),
      Comment.deleteMany(),
      Message.deleteMany(),
      Achievement.deleteMany(),
      Certificate.deleteMany(),
      Banner.deleteMany(),
      Log.deleteMany(),
      ParentFeedback.deleteMany()
    ]);

    console.log('Collections cleared. Generating global settings & default badges...');

    await Setting.create({
      key: 'global_config',
      seoConfig: {
        title: 'EduKids - Học Vui Mỗi Ngày',
        metaDescription: 'Website giáo dục chất lượng cao, vui nhộn dành cho học sinh cấp 1.',
        keywords: 'học trực tuyến, toán lớp 1-5, tiếng việt, khoa học cấp 1'
      }
    });

    const [badgeChamp, badgeStreak, badgeMax] = await Badge.create([
      {
        name: 'Ngôi Sao Siêu Cấp',
        description: 'Nhận được khi hoàn thành khóa học đầu tiên.',
        icon: '🏆',
        xpRequired: 100
      },
      {
        name: 'Nhà Học Tập Chăm Chỉ',
        description: 'Nhận được khi duy trì chuỗi học tập 3 ngày liên tiếp.',
        icon: '🌟',
        coinCost: 50
      },
      {
        name: 'Học Thần Toàn Diện',
        description: 'Đạt điểm tối đa trong bài kiểm tra trắc nghiệm.',
        icon: '🥇',
        xpRequired: 200
      }
    ]);

    console.log('Creating user accounts...');

    const userAdmin = await User.create({
      username: 'admin',
      email: 'admin@edukids.com',
      password: 'adminpassword',
      role: 'admin',
      fullName: 'Bác Quản Trị Viên'
    });
    await Admin.create({ user: userAdmin._id, permissions: ['all'] });

    const userTeacher = await User.create({
      username: 'teacher',
      email: 'teacher@edukids.com',
      password: 'teacherpassword',
      role: 'teacher',
      fullName: 'Cô Giáo Mai Vy'
    });
    await Teacher.create({
      user: userTeacher._id,
      specialty: ['Toán học', 'Tiếng Việt', 'Khoa học'],
      bio: 'Cô tốt nghiệp sư phạm tiểu học với 8 năm kinh nghiệm giảng dạy nhiệt huyết.'
    });

    const userStudent = await User.create({
      username: 'student',
      email: 'student@edukids.com',
      password: 'studentpassword',
      role: 'student',
      fullName: 'Bé Minh Triết'
    });
    await Student.create({
      user: userStudent._id,
      gradeLevel: 3,
      className: '3A1',
      xp: 150,
      coins: 80,
      level: 2,
      badges: [{ badge: badgeChamp._id }]
    });

    console.log('Creating subject categories...');

    const categories = await Category.create([
      {
        name: 'Toán học',
        slug: 'toan-hoc',
        description: 'Môn học phát triển tư duy logic và con số.',
        gradeLevel: 1
      },
      {
        name: 'Tiếng Việt',
        slug: 'tieng-viet',
        description: 'Môn học ngôn ngữ, đọc viết và thơ ca Việt Nam.',
        gradeLevel: 1
      },
      {
        name: 'Khoa học',
        slug: 'khoa-hoc',
        description: 'Khám phá tự nhiên, xã hội và thế giới xung quanh.',
        gradeLevel: 1
      }
    ]);

    const categoryBySubject = {
      math: categories.find((category) => category.slug === 'toan-hoc'),
      vietnamese: categories.find((category) => category.slug === 'tieng-viet'),
      science: categories.find((category) => category.slug === 'khoa-hoc')
    };

    console.log('Creating courses, chapters, lessons, quizzes, and assignments...');

    for (const [index, item] of courseSeeds.entries()) {
      const course = await Course.create({
        title: item.title,
        description: item.description,
        instructor: userTeacher._id,
        category: categoryBySubject[item.subject]._id,
        gradeLevel: item.gradeLevel,
        isPublished: true,
        isApproved: true,
        xpReward: 80 + item.gradeLevel * 20,
        coinReward: 30 + item.gradeLevel * 5,
        enrollmentCount: 8 + index * 2
      });

      const chapter = await Chapter.create({
        course: course._id,
        title: item.chapterTitle,
        order: 1
      });

      const lessons = await Lesson.create(item.lessons.map(([title, description], lessonIndex) => ({
        course: course._id,
        chapter: chapter._id,
        title,
        description,
        contentType: 'text',
        bodyText: `${description}\n\nHoạt động gợi ý: đọc nội dung, quan sát ví dụ, sau đó tự làm 3 câu luyện tập ngắn trong vở.`,
        duration: 600 + lessonIndex * 180,
        order: lessonIndex + 1
      })));

      const quiz = await Quiz.create({
        course: course._id,
        chapter: chapter._id,
        lesson: lessons[0]._id,
        title: `Kiểm tra nhanh: ${item.title}`,
        description: 'Bài kiểm tra ngắn giúp bé ôn lại kiến thức chính của bài học.',
        timeLimit: 10,
        passingScore: 50,
        showAnswersAfterSubmission: true
      });

      const question = await Question.create({
        quiz: quiz._id,
        text: `Khóa học "${item.title}" phù hợp nhất với học sinh lớp mấy?`,
        type: 'single',
        points: 10
      });

      await Answer.create([
        { question: question._id, text: `Lớp ${item.gradeLevel}`, isCorrect: true },
        { question: question._id, text: `Lớp ${Math.max(1, item.gradeLevel - 1)}`, isCorrect: false },
        { question: question._id, text: `Lớp ${Math.min(5, item.gradeLevel + 1)}`, isCorrect: false }
      ]);

      await Assignment.create({
        course: course._id,
        chapter: chapter._id,
        title: item.assignmentTitle,
        instructions: item.assignmentInstructions,
        deadline: addDays(5 + index),
        maxPoints: 10
      });
    }

    console.log('Database seeding complete!');
    console.log('=========================================');
    console.log(`Created ${courseSeeds.length} courses and ${courseSeeds.length} assignments for grades 1-5.`);
    console.log('Default Accounts available:');
    console.log('1. Admin:   admin    / adminpassword');
    console.log('2. Teacher: teacher  / teacherpassword');
    console.log('3. Student: student  / studentpassword');
    console.log('=========================================');
    console.log(`Bonus badges: ${badgeStreak.name}, ${badgeMax.name}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Seeding database failed:', error);
    await mongoose.connection.close();
    process.exitCode = 1;
  }
};

seedDatabase();
