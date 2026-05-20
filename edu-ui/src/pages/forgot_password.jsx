import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, Mail } from "lucide-react";
import { postDataAPI } from "../utils/fetchData";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { getErrorMessage } from "../utils/errorMessage";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading) return;

    try {
      setLoading(true);
      const res = await postDataAPI("forgot_password", { email });
      setSent(true);
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth_page forgot_page">
      <div className="forgot_shell">
        <div className="forgot_brand">Edu Social</div>

        <section className={`forgot_card ${sent ? "is_sent" : ""}`}>
          {sent && (
            <div className="forgot_success">
              <CheckCircle2 size={20} />
              <span>Email đã được gửi. Vui lòng kiểm tra hộp thư.</span>
            </div>
          )}

          <div className="forgot_icon">
            <Mail size={34} />
          </div>

          <div className="forgot_head">
            <h1>Quên mật khẩu?</h1>
            <p>
              Đừng lo lắng. Nhập email liên kết với tài khoản của bạn, hệ thống sẽ gửi liên kết đặt lại mật khẩu an toàn.
            </p>
          </div>

          <form className="forgot_form" onSubmit={handleSubmit}>
            <div className="forgot_field">
              <label htmlFor="forgot_email">Địa chỉ Email</label>
              <div>
                <Mail size={18} />
                <input
                  id="forgot_email"
                  type="email"
                  placeholder="sinhvien@truong.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || sent}
                />
              </div>
            </div>

            <button className="forgot_submit" disabled={!email || loading || sent}>
              {loading ? (
                <>
                  <span className="forgot_spinner" />
                  Đang gửi...
                </>
              ) : sent ? (
                <>
                  <CheckCircle2 size={18} />
                  Đã gửi yêu cầu
                </>
              ) : (
                <>
                  Gửi yêu cầu đặt lại
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <Link to="/" className="forgot_back">
            <ArrowLeft size={16} />
            Quay lại đăng nhập
          </Link>
        </section>

        <p className="forgot_help">
          <HelpCircle size={15} />
          Cần hỗ trợ thêm? <Link to="/landing">Xem thông tin hệ thống</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
