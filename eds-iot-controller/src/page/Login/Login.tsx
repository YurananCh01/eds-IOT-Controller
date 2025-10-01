import '../Login/Login.css'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type LoginInput = {
  emp_email: string;
  emp_pass: string;
};

type LoginSuccess = {
  token: string; // JWT
  user: {
    id: number;
    name: string;
    email: string;
    role: "Admin" | "User" | string;
  };
};

export default function Login() {
    const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
    const navigate = useNavigate();
    const [input, setInput] = useState<LoginInput>({ emp_email: "", emp_pass: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setInput((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting) return;

        setError("");
        setSubmitting(true);

        // setTimeout(() => {
        //     if (
        //         input.emp_email.trim().toLowerCase() === "admin@gmail.com" &&
        //         input.emp_pass === "Qwerty123?"
        //     ) {
        //         localStorage.setItem("auth_token", "mock-token-123");
        //         localStorage.setItem(
        //             "user",
        //             JSON.stringify({ name: "Tester", role: "Admin", email: input.emp_email })
        //         );
        //         navigate("/templateAdmin"); 
        //     } else {
        //         setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        //     }
        //     setSubmitting(false);
        // }, 700);
    try {
      const res = await axios.post<LoginSuccess>(`${API}/api/login`, {
        email: input.emp_email.trim(),
        password: input.emp_pass,
      }, {
        timeout: 10000,
      });

      // บันทึก token + user
      localStorage.setItem("auth_token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ไปหน้า admin
      navigate("/templateAdmin");
    } catch (err: any) {
      // แสดงข้อความ error จากเซิร์ฟเวอร์ถ้ามี
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
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
                            src="/img/logo.png" //เปลี่ยนโลโก้
                            alt="Logo"
                            className="logo-login"
                            style={{ width: '200px' }}
                        />
                        <h2>เข้าสู่ระบบ</h2>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>อีเมล</label>
                            <input
                                type="text"
                                name="emp_email"
                                value={input.emp_email}
                                onChange={handleInputChange}
                                placeholder="กรอกอีเมล"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>รหัสผ่าน</label>
                            <input
                                type="password"
                                name="emp_pass"
                                value={input.emp_pass}
                                onChange={handleInputChange}
                                placeholder="กรอกรหัสผ่าน"
                                required
                            />
                        </div>
                        {error && <p className="error">{error}</p>}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={submitting}
                            aria-busy={submitting}
                            >
                            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
