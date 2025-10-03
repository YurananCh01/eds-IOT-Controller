// src/pages/Login/Login.tsx
import '../Login/Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type LoginForm = {
  username: string;
  password: string;
};

type LoginSuccess = {
  ok: true;
  user: { id: number; user_name: string };
  token?: string;
};

type LoginFail = {
  ok: false;
  error?: string;
  message?: string;
};

type LoginResponse = LoginSuccess | LoginFail;

const API = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:5151';

export default function Login() {
  const navigate = useNavigate();
  const [input, setInput] = useState<LoginForm>({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setError('');
    setSubmitting(true);

    try {
      const { data, status } = await axios.post<LoginResponse>(
        `${API}/auth/login`,
        { username: input.username.trim(), password: input.password },
        {
          // ไม่ใช้ withCredentials เพราะเราใช้ JWT header ไม่ใช่คุกกี้
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
          validateStatus: () => true, // อ่าน body ได้แม้ 4xx
        }
      );

      if (status !== 200 || !data || (data as LoginFail).ok === false) {
        const msg =
          (data as LoginFail)?.error ||
          (data as LoginFail)?.message ||
          'เข้าสู่ระบบไม่สำเร็จ';
        setError(msg);
        return;
      }

      const success = data as LoginSuccess;

      // เก็บ token + user ตามต้องการ
      if (success.token) {
        localStorage.setItem('token', success.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${success.token}`;
      }
      localStorage.setItem('user', JSON.stringify(success.user));

      // ไปหน้าแอดมิน (ปรับเส้นทางตามโปรเจกต์)
      navigate('/templateAdmin', { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="logo-title">
            <img
              src="/img/logo.png"
              alt="Logo"
              className="logo-login"
              style={{ width: '200px' }}
            />
            <h2>เข้าสู่ระบบ</h2>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="user_name">ชื่อผู้ใช้</label>
              <input
                id="user_name"
                type="text"
                name="username"
                value={input.username}
                onChange={handleInputChange}
                placeholder="กรอกชื่อผู้ใช้"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">รหัสผ่าน</label>
              <input
                id="password"
                type="password"
                name="password"
                value={input.password}
                onChange={handleInputChange}
                placeholder="กรอกรหัสผ่าน"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button
              type="submit"
              className="login-button"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
