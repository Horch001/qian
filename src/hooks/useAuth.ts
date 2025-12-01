import { useState, useEffect, useCallback } from 'react';
import { authApi, LoginResponse } from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  balance: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化时检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authApi.getCurrentUser()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          // Token 无效，清除
          localStorage.removeItem('authToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      // 登录前清除所有旧数据
      localStorage.clear();
      
      const response = await authApi.login({ email, password });
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // 注册
  const register = useCallback(async (email: string, password: string, username?: string) => {
    setError(null);
    try {
      // 注册前清除所有旧数据
      localStorage.clear();
      
      const response = await authApi.register({ email, password, username });
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Pi Network 登录
  const piLogin = useCallback(async (piUid: string, accessToken: string, username?: string) => {
    setError(null);
    try {
      // Pi登录前清除所有旧数据
      localStorage.clear();
      
      const response = await authApi.piLogin({ piUid, accessToken, username });
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('piUserInfo');
    localStorage.removeItem('userInfo');
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    isLoggedIn: !!user,
    login,
    register,
    piLogin,
    logout,
  };
}
