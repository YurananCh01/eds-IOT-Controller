import '../Login/Login.css'
//import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";



export default function Login() {
    const navigate = useNavigate();
    const [input, setInput] = useState({ emp_email: "", emp_pass: "" });
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

        setTimeout(() => {
            if (
                input.emp_email.trim().toLowerCase() === "admin@gmail.com" &&
                input.emp_pass === "Qwerty123?"
            ) {
                localStorage.setItem("auth_token", "mock-token-123");
                localStorage.setItem(
                    "user",
                    JSON.stringify({ name: "Tester", role: "Admin", email: input.emp_email })
                );
                navigate("/templateAdmin"); 
            } else {
                setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
            }
            setSubmitting(false);
        }, 700);
    };
    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-box">
                    <div className="logo-title">
                        <img
                            src="../assets/react.svg" //เปลี่ยนโลโก้
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
                                type="email"
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
                        <button type="submit" className="login-button">
                            เข้าสู่ระบบ
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
