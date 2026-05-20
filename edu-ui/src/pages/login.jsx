/** @format */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../redux/actions/authAction";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, BrainCircuit, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";

const Login = () => {
  const initialState = { email: "", password: "" };
  const [userData, setUserData] = useState(initialState);
  const { email, password } = userData;

  const [typePass, setTypePass] = useState(false);

  const { auth } = useSelector((state) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.token) navigate("/");
  }, [auth.token, navigate]);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(userData));
  };

  return (
    <div className="auth_page login_page">
      <section className="login_shell">
        <aside className="login_brand">
          <div className="login_brand_content">
            <h1>Edu Social</h1>
            <p>Nền tảng học tập xã hội kết hợp AI. Kết nối, học hỏi và phát triển cùng cộng đồng.</p>
          </div>
          <div className="login_illustration" aria-hidden="true">
            <BrainCircuit size={180} />
            <div className="login_orbit one" />
            <div className="login_orbit two" />
            <div className="login_orbit three" />
          </div>
        </aside>

        <div className="login_panel">
          <div className="login_mobile_brand">
            <h1>Edu Social</h1>
            <p>Đăng nhập để tiếp tục</p>
          </div>

          <form className="login_form" onSubmit={handleSubmit}>
            <div className="login_head">
              <span><Sparkles size={16} /> Learning network</span>
              <h2>Chào mừng trở lại</h2>
              <p>Vui lòng đăng nhập vào tài khoản của bạn.</p>
            </div>

            <div className="login_field">
              <label htmlFor="exampleInputEmail1">Email</label>
              <div className="login_input">
                <Mail size={18} />
                <input
                  type="email"
                  id="exampleInputEmail1"
                  name="email"
                  placeholder="nhap@email.com"
                  onChange={handleChangeInput}
                  value={email}
                />
              </div>
            </div>

            <div className="login_field">
              <div className="login_label_row">
                <label htmlFor="exampleInputPassword1">Mật khẩu</label>
                <Link to="/forgot_password">Quên mật khẩu?</Link>
              </div>

              <div className="login_input">
                <Lock size={18} />
                <input
                  type={typePass ? "text" : "password"}
                  id="exampleInputPassword1"
                  onChange={handleChangeInput}
                  value={password}
                  name="password"
                  placeholder="••••••••"
                />

                <button type="button" onClick={() => setTypePass(!typePass)} aria-label={typePass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                  {typePass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login_submit" disabled={email && password ? false : true}>
              Đăng nhập
            </button>

            <p className="login_register">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>

            <Link to="/landing" className="login_back">
              <ArrowLeft size={16} />
              Giới thiệu hệ thống Edu Social
            </Link>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Login;
