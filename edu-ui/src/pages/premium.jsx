import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDataAPI, postDataAPI } from "../utils/fetchData";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { MESS_TYPES } from "../redux/actions/messageAction";
import { getErrorMessage } from "../utils/errorMessage";

const Premium = () => {
  const { auth } = useSelector((state) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  const isPremium = auth.user?.aiEnabled;

  const messageAdmin = async () => {
    if (!auth.token) return;
    setMessageLoading(true);
    try {
      const res = await getDataAPI("premium/admin-contact", auth.token);
      const admin = { ...res.data.admin, text: "", media: [] };
      dispatch({ type: MESS_TYPES.ADD_USER, payload: admin });
      navigate(`/message/${admin._id}`);
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    } finally {
      setMessageLoading(false);
    }
  };

  const buyPremium = async () => {
    setLoading(true);
    try {
      const res = await postDataAPI("premium/checkout", {}, auth.token);
      window.location.href = res.data.url;
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
      setLoading(false);
    }
  };

  const benefits = [
    "Trợ lý AI lập kế hoạch học tập cá nhân",
    "Chat tutor bằng giọng nói",
    "Phân tích bài tập chuyên sâu",
    "Không giới hạn câu hỏi mỗi ngày",
  ];

  return (
    <div style={{
      minHeight: "calc(100vh - 80px)",
      background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f8f9ff 100%)",
      padding: "40px 16px 60px",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: "absolute", top: "-10%", left: "-10%",
        width: "50%", height: "50%", borderRadius: "50%",
        background: "rgba(37,99,235,0.07)", filter: "blur(100px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-10%",
        width: "40%", height: "40%", borderRadius: "50%",
        background: "rgba(211,228,254,0.45)", filter: "blur(80px)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Hero Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: "16px",
            lineHeight: 1.2,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Nâng tầm học tập với{" "}
            <span style={{ color: isPremium ? "#10b981" : "#1d4ed8" }}>Premium AI</span>
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "#64748b",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Mở khóa toàn bộ tiềm năng học thuật của bạn với các công cụ AI chuyên sâu, được thiết kế riêng cho môi trường giáo dục.
          </p>
        </div>

        {/* Pricing Card */}
        <div style={{ maxWidth: "440px", margin: "0 auto 40px" }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "36px 32px",
            boxShadow: isPremium 
              ? "0 20px 60px rgba(16,185,129,0.12), 0 4px 16px rgba(0,0,0,0.06)" 
              : "0 20px 60px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.06)",
            border: isPremium 
              ? "2px solid #10b981" 
              : "1px solid rgba(37,99,235,0.12)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Top accent bar */}
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "4px",
              background: isPremium 
                ? "linear-gradient(90deg, #059669, #10b981)" 
                : "linear-gradient(90deg, #1d4ed8, #3b82f6)",
            }} />

            {/* Card Header */}
            <div style={{ textAlign: "center", marginBottom: "28px", marginTop: "8px" }}>
              <span style={{
                display: "inline-block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: isPremium ? "#059669" : "#1d4ed8",
                background: isPremium ? "#ecfdf5" : "#eff6ff",
                padding: "4px 12px",
                borderRadius: "999px",
                marginBottom: "16px",
              }}>
                {isPremium ? "Đang hoạt động" : "Premium Plan"}
              </span>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
                <span style={{
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  20 $
                </span>
                <span style={{ fontSize: "0.875rem", color: "#94a3b8" }}>/ tháng</span>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ borderColor: "#e2e8f0", marginBottom: "24px" }} />

            {/* Benefits */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
              {benefits.map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <svg style={{ width: "18px", height: "18px", color: isPremium ? "#10b981" : "#1d4ed8", flexShrink: 0, marginTop: "2px" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>

            {isPremium && (
              <div style={{
                textAlign: "center",
                color: "#047857",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "20px",
                background: "#ecfdf5",
                padding: "12px",
                borderRadius: "12px",
                border: "1px dashed #10b981",
                lineHeight: "1.4",
              }}>
                Cảm ơn bạn đã nâng cấp! Gói Premium đã kích hoạt, bạn có thể sử dụng tất cả tính năng AI.
              </div>
            )}

            {/* CTA Button */}
            {isPremium ? (
              <div style={{
                width: "100%",
                padding: "14px 20px",
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                color: "#ffffff",
                borderRadius: "14px",
                fontSize: "0.95rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
              }}>
                <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Gói Premium Đang Hoạt Động
              </div>
            ) : (
              <button
                onClick={buyPremium}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  background: loading ? "#93c5fd" : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
                  transition: "all 0.2s ease",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {loading ? "Đang xử lý..." : "Nâng cấp ngay"}
                {!loading && (
                  <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </button>
            )}

            {/* Trust badge */}
            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#94a3b8" }}>
              <svg style={{ width: "13px", height: "13px" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span style={{ fontSize: "12px" }}>Đã được bảo mật bởi Stripe</span>
            </div>

            {/* Secondary Action */}
            <button
              onClick={messageAdmin}
              disabled={messageLoading || !auth.token}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "12px 20px",
                background: "transparent",
                color: "#64748b",
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: messageLoading || !auth.token ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: messageLoading || !auth.token ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (!messageLoading && auth.token) {
                  e.currentTarget.style.borderColor = "#93c5fd";
                  e.currentTarget.style.background = "#eff6ff";
                  e.currentTarget.style.color = "#1d4ed8";
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              {messageLoading ? "Đang mở..." : "Liên hệ Admin"}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          maxWidth: "600px",
          margin: "0 auto",
        }}>
          {[
            { icon: "✓", title: "Thanh toán an toàn", desc: "Sử dụng Stripe - Nền tảng thanh toán hàng đầu thế giới" },
            { icon: "⚡", title: "Kích hoạt ngay", desc: "Premium AI được kích hoạt tự động sau khi thanh toán thành công" },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              borderRadius: "18px",
              padding: "20px",
              border: "1px solid rgba(37,99,235,0.1)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#1d4ed8" }}>{icon}</span> {title}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.5, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Premium;
