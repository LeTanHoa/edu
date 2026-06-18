import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, BookOpen } from 'lucide-react';
import api from '../../services/api';

const COURSES_PER_PAGE = 6;

const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedGrade, setSelectedGrade] = useState(searchParams.get('gradeLevel') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [pagination, setPagination] = useState({ page: 1, limit: COURSES_PER_PAGE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setSelectedGrade(searchParams.get('gradeLevel') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  useEffect(() => {
    // Fetch categories
    api.get('/courses/categories')
      .then(res => {
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    if (!categoryParam || categories.length === 0) return;

    const categoryExists = categories.some((category) => category._id === categoryParam);
    if (categoryExists) return;

    const categoryBySlug = categories.find((category) => category.slug === categoryParam);
    if (categoryBySlug) {
      setSelectedCategory(categoryBySlug._id);
    }
  }, [categories, searchParams]);

  useEffect(() => {
    setLoading(true);
    // Fetch courses based on search params
    const queryParams = {};
    const gradeLevel = searchParams.get('gradeLevel');
    const category = searchParams.get('category');
    const keywordParam = searchParams.get('keyword');
    const page = searchParams.get('page') || '1';

    if (gradeLevel) queryParams.gradeLevel = gradeLevel;
    if (category) queryParams.category = category;
    if (keywordParam) queryParams.keyword = keywordParam;
    queryParams.page = page;
    queryParams.limit = String(COURSES_PER_PAGE);

    const queryString = new URLSearchParams(queryParams).toString();
    
    api.get(`/courses?${queryString}`)
      .then(res => {
        if (res.data.success) {
          setCourses(res.data.courses || res.data.data || []);
          setPagination(res.data.pagination || { page: Number(page), limit: COURSES_PER_PAGE, total: 0, totalPages: 1 });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const currentParams = {};
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) currentParams.keyword = trimmedKeyword;
    if (selectedGrade) currentParams.gradeLevel = selectedGrade;
    if (selectedCategory) currentParams.category = selectedCategory;
    currentParams.page = '1';
    setSearchParams(currentParams);
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedGrade('');
    setSelectedCategory('');
    setSearchParams({});
  };

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), pagination.totalPages || 1);
    const currentParams = Object.fromEntries(searchParams.entries());

    if (nextPage === 1) {
      delete currentParams.page;
    } else {
      currentParams.page = String(nextPage);
    }

    setSearchParams(currentParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage = pagination.page || Number(searchParams.get('page')) || 1;
  const totalPages = pagination.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-20">
      
      {/* Header and title */}
      <div className="text-center mb-12 flex flex-col gap-3">
        <h1 className="text-4xl font-black font-comic">Thư Viện Khóa Học 📚</h1>
        <p className="text-slate-500 font-bold text-sm">Tìm kiếm những bài giảng vui nhộn và phù hợp nhất với em nhé!</p>
      </div>

      {/* Filter and Search Panel */}
      <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-4 border-slate-100 dark:border-slate-700/80 shadow-[0_8px_0_0_#f1f5f9] dark:shadow-[0_8px_0_0_#1e293b] flex flex-wrap gap-4 items-end mb-12">
        
        {/* Search */}
        <div className="flex-1 min-w-[240px] flex flex-col gap-1.5 font-bold">
          <label className="text-sm text-slate-600 dark:text-slate-400">Từ khóa tìm kiếm</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Nhập tên khóa học..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none transition-all text-sm font-semibold"
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          </div>
        </div>

        {/* Grade Filter */}
        <div className="w-full sm:w-48 flex flex-col gap-1.5 font-bold">
          <label className="text-sm text-slate-600 dark:text-slate-400">Khối Lớp</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none transition-all text-sm font-bold"
          >
            <option value="">Tất cả các lớp</option>
            {[1, 2, 3, 4, 5].map(g => (
              <option key={g} value={g}>Học sinh lớp {g}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-48 flex flex-col gap-1.5 font-bold">
          <label className="text-sm text-slate-600 dark:text-slate-400">Môn Học</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none transition-all text-sm font-bold"
          >
            <option value="">Tất cả các môn</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2 w-full md:w-auto font-bold">
          <button 
            type="submit"
            className="flex-1 md:flex-none px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-[0_4px_0_0_#0284c7] active:translate-y-0.5 active:shadow-none hover:scale-102 transition-all flex items-center justify-center gap-1.5"
          >
            <Filter size={18} />
            <span>Lọc Kết Quả</span>
          </button>
          
          <button 
            type="button"
            onClick={clearFilters}
            className="px-6 py-3.5 border-4 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-500 font-bold hover:text-slate-700 transition-all text-sm"
          >
            Xóa Lọc
          </button>
        </div>

      </form>

      {/* Courses display */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : courses?.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-850 rounded-3xl border-4 border-slate-100 dark:border-slate-750 flex flex-col items-center gap-4">
          <span className="text-6xl">🏜️</span>
          <h3 className="text-2xl font-black font-comic">Không tìm thấy khóa học nào</h3>
          <p className="text-slate-400 font-bold max-w-sm">Hãy thử thay đổi từ khóa hoặc bộ lọc lớp học xem nhé!</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 mb-6 text-sm font-bold text-slate-500 dark:text-slate-400">
            <span>Hiển thị {courses.length} trong {pagination.total} khóa học</span>
            <span>Trang {currentPage}/{totalPages}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses?.map(course => (
              <div key={course._id} className="card-playful flex flex-col h-full bg-white dark:bg-slate-800">
                <div className="h-44 bg-primary-100 flex items-center justify-center text-5xl relative overflow-hidden border-b-4 border-slate-100 dark:border-slate-750">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <span>📚</span>
                  )}
                  <div className="absolute top-3 right-3 bg-sunny-400 border-2 border-white px-3 py-1 rounded-full text-xs font-black text-amber-900 shadow-sm">
                    Lớp {course.gradeLevel}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-primary-500">{course.category?.name || 'Môn học'}</span>
                    <h3 className="text-lg font-black mt-1 line-clamp-2">{course.title}</h3>
                    <p className="text-slate-500 text-xs mt-2 font-semibold line-clamp-3">{course.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-slate-50 dark:border-slate-750/50">
                    <span className="text-xs font-bold text-slate-400">GV: {course.instructor?.fullName}</span>
                    <Link 
                      to={`/courses/${course._id}`} 
                      className="px-4 py-2 bg-primary-500 text-white rounded-2xl text-xs font-bold hover:scale-105 active:translate-y-0.5 transition-all shadow-[0_3px_0_0_#0284c7]"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2.5 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-black text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary-500"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`w-11 h-11 rounded-2xl text-sm font-black border-4 transition-all ${
                    currentPage === page
                      ? 'bg-primary-500 text-white border-primary-500 shadow-[0_4px_0_0_#0284c7]'
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:text-primary-500'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2.5 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-black text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary-500"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default CourseList;
