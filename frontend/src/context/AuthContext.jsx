import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on mount
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Lỗi tự động đăng nhập:', error);
          logout();
        }
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        setUser(res.data.user);

        // Fetch detailed profile
        const meRes = await api.get('/auth/me');
        setProfile(meRes.data.profile);
        setLoading(false);
        return { success: true, user: res.data.user };
      }
      setLoading(false);
      return { success: false, message: res.data.message };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối.'
      };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        setUser(res.data.user);

        // Fetch detailed profile
        const meRes = await api.get('/auth/me');
        setProfile(meRes.data.profile);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, message: res.data.message };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại. Tên đăng nhập hoặc Email có thể đã trùng.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem("hide_course_guide");
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (error) {
      console.error('Không thể cập nhật hồ sơ cá nhân:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
