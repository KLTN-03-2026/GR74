import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDataAPI, postDataAPI } from "../utils/fetchData";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { MESS_TYPES } from "../redux/actions/messageAction";
import { getErrorMessage } from "../utils/errorMessage";

const PremiumSuccess = () => {
  const { auth } = useSelector((state) => state);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Xác nhận thanh toán...");
  const [success, setSuccess] = useState(false);
  const [transactionId] = useState("#TRX-98234-EDU");
  const [contactingAdmin, setContactingAdmin] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" }));
    createConfetti();
  }, []);

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get("session_id");
    if (!sessionId) { setStatus("Thiếu session ID từ Stripe."); return; }
    if (!auth.token) { setStatus("Đang khôi phục phiên của bạn..."); return; }

    const confirm = async () => {
      try {
        const res = await postDataAPI("premium/confirm", { sessionId }, auth.token);
        dispatch({ type: GLOBALTYPES.AUTH, payload: { ...auth, user: res.data.user } });
        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
        setStatus(res.data.msg);
        setSuccess(true);
      } catch (err) {
        const message = getErrorMessage(err);
        dispatch({ type: GLOBALTYPES.ALERT, payload: { error: message } });
        setStatus(message);
      }
    };
    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, auth.token]);

  const contactAdmin = async () => {
    if (!auth.token) return;
    setContactingAdmin(true);
    try {
      const res = await getDataAPI("premium/admin-contact", auth.token);
      const admin = res.data.admin;
      dispatch({ type: MESS_TYPES.ADD_USER, payload: { ...admin, text: "", media: [] } });
      navigate(`/message/${admin._id}`);
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Không tìm thấy admin. Vui lòng thử lại." } });
      setContactingAdmin(false);
    }
  };

  const createConfetti = () => {
    const container = document.getElementById("confetti-ps");
    if (!container) return;
    const colors = ["#2563eb", "#004ac6", "#b4c5ff", "#93c5fd", "#dbeafe"];
    for (let i = 0; i < 55; i++) {
      const el = document.createElement("div");
      const size = 6 + Math.random() * 7;
      el.style.cssText = `
        position:absolute; width:${size}px; height:${size}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${Math.random() * 100}vw; opacity:0;
        animation:cfall ${2.2 + Math.random() * 2}s ease-out ${Math.random() * 3.5}s infinite;
        border-radius:${Math.random() > 0.5 ? "50%" : "3px"};
      `;
      container.appendChild(el);
    }
  };

  const txRows = [
    { label: "Gói dịch vụ", value: "Premium Hàng tháng" },
    { label: "Mã giao dịch", value: transactionId },
    { label: "Ngày thanh toán", value: currentDate },
  ];

  return (
    <div style={{
      minHeight: "calc(100vh - 80px)",
      background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f8f9ff 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 16px", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes cfall {
          0%   { transform: translateY(-60px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh)  rotate(400deg); opacity: 0; }
        }
        @keyframes pring {
          0%   { transform:scale(.85); box-shadow:0 0 0 0 rgba(37,99,235,.4); }
          70%  { transform:scale(1);   box-shadow:0 0 0 18px rgba(37,99,235,0); }
          100% { transform:scale(.85); box-shadow:0 0 0 0 rgba(37,99,235,0); }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(.6); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* Confetti */}
      <div id="confetti-ps" style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }} />

      {/* Blobs */}
      <div style={{ position:"absolute", top:"-10%", left:"-10%", width:"45%", height:"45%", borderRadius:"50%", background:"rgba(37,99,235,.07)", filter:"blur(90px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"-10%", right:"-10%", width:"35%", height:"35%", borderRadius:"50%", background:"rgba(211,228,254,.4)", filter:"blur(70px)", pointerEvents:"none" }} />

      <div style={{ width:"100%", maxWidth:"520px", position:"relative", zIndex:1 }}>
        <div style={{
          background:"#ffffff",
          borderRadius:"24px",
          padding:"40px 32px",
          boxShadow:"0 24px 70px rgba(37,99,235,0.13), 0 4px 16px rgba(0,0,0,0.06)",
          border:"1px solid rgba(37,99,235,0.1)",
          display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center",
        }}>

          {/* Icon */}
          <div style={{ position:"relative", width:"88px", height:"88px", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"24px" }}>
            <div style={{
              position:"absolute", inset:0, borderRadius:"50%",
              background:"rgba(37,99,235,0.09)",
              animation: success ? "pring 2s cubic-bezier(.215,.61,.355,1) infinite" : "none",
            }} />
            <div style={{
              width:"60px", height:"60px", borderRadius:"50%",
              background:"linear-gradient(135deg,#1d4ed8,#2563eb)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 12px 32px rgba(37,99,235,0.3)", zIndex:1,
              animation: success ? "popIn 0.5s cubic-bezier(.34,1.56,.64,1) both" : "none",
            }}>
              <svg style={{ width:"30px", height:"30px", color:"#fff" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:800,
            color: success ? "#1d4ed8" : "#334155",
            marginBottom:"12px", lineHeight:1.2,
            fontFamily:"'Plus Jakarta Sans',sans-serif",
            animation: success ? "slideUp 0.5s ease both" : "none",
          }}>
            {success ? "Thanh toán thành công!" : "Đang xử lý..."}
          </h1>
          <p style={{
            fontSize:"0.95rem", color:"#64748b",
            marginBottom:"28px", maxWidth:"380px", lineHeight:1.6,
            animation: success ? "slideUp 0.5s 0.1s ease both" : "none",
            opacity: success ? undefined : 0,
          }}>
            Tài khoản của bạn đã được nâng cấp lên Premium. Trợ lý AI đã sẵn sàng hỗ trợ bạn trong học tập.
          </p>

          {/* Status / loading */}
          {!success && (
            <div style={{
              width:"100%", padding:"14px 16px", marginBottom:"24px",
              background:"#eff6ff", borderRadius:"12px",
              border:"1px solid #bfdbfe", color:"#1e40af", fontSize:"0.875rem",
            }}>
              {status}
            </div>
          )}

          {/* Transaction card */}
          {success && (
            <div style={{
              width:"100%", background:"#f8fafc", borderRadius:"16px",
              padding:"20px", marginBottom:"28px", textAlign:"left",
              border:"1px solid #e2e8f0",
            }}>
              <p style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"16px" }}>
                Chi tiết giao dịch
              </p>
              {txRows.map(({ label, value }) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #f1f5f9", paddingBottom:"10px", marginBottom:"10px" }}>
                  <span style={{ fontSize:"0.8rem", color:"#94a3b8" }}>{label}</span>
                  <span style={{ fontSize:"0.8rem", fontWeight:700, color:"#334155" }}>{value}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"4px" }}>
                <span style={{ fontSize:"0.9rem", fontWeight:700, color:"#0f172a" }}>Tổng tiền</span>
                <span style={{ fontSize:"1.3rem", fontWeight:800, color:"#1d4ed8", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>199.000đ</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:"10px" }}>
            <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
              <Link
                to="/"
                style={{
                  flex:1, padding:"13px 16px", minWidth:"120px",
                  background:"#f1f5f9", borderRadius:"12px",
                  color:"#475569", fontSize:"0.875rem", fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
                  textDecoration:"none", transition:"all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background="#e2e8f0"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#f1f5f9"; }}
              >
                <svg style={{ width:"15px", height:"15px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Về trang chủ
              </Link>
              <button
                onClick={() => navigate("/message")}
                style={{
                  flex:1, padding:"13px 16px", minWidth:"120px",
                  background:"linear-gradient(135deg,#1d4ed8,#2563eb)",
                  borderRadius:"12px", color:"#fff",
                  fontSize:"0.875rem", fontWeight:700, border:"none",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
                  boxShadow:"0 8px 20px rgba(37,99,235,0.28)", cursor:"pointer",
                  transition:"all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform="scale(1.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; }}
              >
                Chat với AI ngay
                <svg style={{ width:"15px", height:"15px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Contact Admin button */}
            <button
              onClick={contactAdmin}
              disabled={contactingAdmin}
              style={{
                width:"100%", padding:"13px 16px",
                background: contactingAdmin ? "#f1f5f9" : "#fff",
                border:"1.5px solid #cbd5e1",
                borderRadius:"12px", color:"#475569",
                fontSize:"0.875rem", fontWeight:700, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                transition:"all 0.2s",
              }}
              onMouseEnter={e => { if (!contactingAdmin) { e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.color="#2563eb"; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#cbd5e1"; e.currentTarget.style.color="#475569"; }}
            >
              <svg style={{ width:"16px", height:"16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {contactingAdmin ? "Đang kết nối..." : "Liên hệ Admin để kích hoạt Premium"}
            </button>

            {/* Receipt link */}
            {success && (
              <a href="#" style={{
                marginTop:"8px", fontSize:"12px", color:"#94a3b8",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"4px",
                textDecoration:"none", transition:"color 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color="#1d4ed8"; }}
                onMouseLeave={e => { e.currentTarget.style.color="#94a3b8"; }}
              >
                <svg style={{ width:"13px", height:"13px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Tải biên lai PDF
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSuccess;
