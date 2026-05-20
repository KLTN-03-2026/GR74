/** @format */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../redux/actions/authAction";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="lp_root">
      <aside className="lp_brand">
        <div className="lp_brand_logo">
          <img src="/edu.png" alt="Edu Social" />
          <span>Edu Social</span>
        </div>
        <div className="lp_brand_body">
          <h1>Học cùng nhau,<br />tiến xa hơn.</h1>
          <p>Nền tảng học tập xã hội kết hợp AI — kết nối, chia sẻ và phát triển cùng cộng đồng sinh viên.</p>
          <ul className="lp_features">
            <li><span className="material-icons">auto_awesome</span> AI hỗ trợ học tập cá nhân hoá</li>
            <li><span className="material-icons">groups</span> Kết nối cộng đồng học tập</li>
            <li><span className="material-icons">workspace_premium</span> Nội dung premium chất lượng cao</li>
          </ul>
        </div>
        <p className="lp_brand_footer">© 2025 Edu Social · Hệ thống học tập thông minh</p>
      </aside>

      <main className="lp_panel">
        <form className="lp_form" onSubmit={handleSubmit}>
          <div className="lp_form_logo">
            <img src="/edu.png" alt="Edu Social" />
          </div>

          <div className="lp_form_head">
            <h2>Chào mừng trở lại</h2>
            <p>Đăng nhập vào tài khoản của bạn để tiếp tục.</p>
          </div>

          <div className="lp_field">
            <label htmlFor="lp_email">Email</label>
            <input
              id="lp_email"
              type="email"
              name="email"
              placeholder="example@email.com"
              value={email}
              onChange={handleChangeInput}
              autoComplete="email"
            />
          </div>

          <div className="lp_field">
            <div className="lp_label_row">
              <label htmlFor="lp_password">Mật khẩu</label>
              <Link to="/forgot_password">Quên mật khẩu?</Link>
            </div>
            <div className="lp_pass_wrap">
              <input
                id="lp_password"
                type={typePass ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={handleChangeInput}
                autoComplete="current-password"
              />
              <button type="button" className="lp_eye" onClick={() => setTypePass(!typePass)} aria-label="Hiện/ẩn mật khẩu">
                {typePass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="lp_submit" disabled={!email || !password}>
            Đăng nhập
          </button>

          <p className="lp_register">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>

          <Link to="/landing" className="lp_back">
            <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>
            Tìm hiểu về Edu Social
          </Link>
        </form>
      </main>
    </div>
  );
};

export default Login;
