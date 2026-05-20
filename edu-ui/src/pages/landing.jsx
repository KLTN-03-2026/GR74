/** @format */

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  CheckCircle2,
  Cpu,
  Globe2,
  Layers,
  MessageCircle,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import "../styles/landing.css";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const authors = [
  { name: "Phong", role: "Đồng phát triển", initial: "Ph" },
  { name: "Thông", role: "Đồng phát triển", initial: "Th" },
  { name: "Quang", role: "Đồng phát triển", initial: "Q" },
  { name: "Thái", role: "Đồng phát triển", initial: "Tá" },
  { name: "Minh", role: "Đồng phát triển", initial: "Mi" },
];

const overviewCards = [
  {
    icon: <Layers size={22} />,
    title: "Luồng trải nghiệm liền mạch",
    body: "Đăng nhập một lần, di chuyển giữa Trang chủ, Tin nhắn, Khám phá và Hồ sơ mà không vỡ ngữ cảnh.",
  },
  {
    icon: <Globe2 size={22} />,
    title: "Thiết kế cho cộng đồng học tập",
    body: "Tập trung vào chia sẻ nội dung, tương tác có kiểm soát và liên lạc rõ ràng giữa thành viên.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Kiểm soát tài khoản",
    body: "Hỗ trợ đổi mật khẩu, phục hồi tài khoản qua email, thông báo và giao diện sáng/tối.",
  },
];

const featureCards = [
  {
    icon: <Sparkles size={22} />,
    title: "Bảng tin học tập",
    body: "Đăng trạng thái, hình ảnh, video, thích, lưu và bình luận nhiều cấp cho các thảo luận học tập.",
  },
  {
    icon: <MessageCircle size={22} />,
    title: "Chat realtime",
    body: "Nhắn tin 1-1, nhóm chat, đồng bộ online/offline bằng Socket.io và hỗ trợ gọi qua PeerJS.",
  },
  {
    icon: <Bot size={22} />,
    title: "Chatbot AI Premium",
    body: "Trợ lý học tập trả lời bằng tiếng Việt, giới hạn vào giải thích kiến thức, luyện tập và gợi ý bước học tiếp theo.",
  },
];

const adminCards = [
  {
    icon: <BookOpen size={22} />,
    title: "Hồ sơ cá nhân",
    body: "Hiển thị bài viết, bài đã lưu, người theo dõi và chỉnh sửa thông tin công khai.",
  },
  {
    icon: <Cpu size={22} />,
    title: "Premium và thanh toán",
    body: "Luồng nâng cấp Premium, xác nhận thanh toán và bật quyền AI cho tài khoản đã thanh toán.",
  },
  {
    icon: <Radar size={22} />,
    title: "Admin",
    body: "Dashboard, quản lý người dùng, kiểm duyệt bài viết và cấu hình quyền AI theo vai trò.",
  },
];

function LandingCard({ card, index }) {
  return (
    <motion.article className="landing-card" custom={index} variants={fadeUp}>
      <div className="landing-card-icon">{card.icon}</div>
      <h3>{card.title}</h3>
      <p>{card.body}</p>
    </motion.article>
  );
}

function Landing() {
  return (
    <div className="landing-page">
      <main id="top" className="landing-inner">
        <section className="landing-hero" aria-labelledby="landing-hero-title">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="landing-kicker">
              <Zap size={16} />
              Mạng xã hội học tập tích hợp AI
            </div>
            <h1 id="landing-hero-title">Edu Social</h1>
            <p className="lead">
              Nền tảng kết hợp bảng tin, thảo luận, nhắn tin realtime, gọi nhóm, hồ sơ cá nhân,
              Premium và chatbot AI để hỗ trợ cộng đồng học tập trên một giao diện thống nhất.
            </p>
            <div className="landing-hero-cta">
              <Link to="/register" className="btn-landing btn-landing-primary">
                Tạo tài khoản
              </Link>
              <a href="#gioi-thieu" className="btn-landing btn-landing-ghost">
                Xem tổng quan
              </a>
            </div>
            <div className="landing-metrics" role="list">
              <div className="landing-metric" role="listitem">
                <strong>Realtime</strong>
                <span>Tin nhắn, thông báo và trạng thái online</span>
              </div>
              <div className="landing-metric" role="listitem">
                <strong>AI</strong>
                <span>Trợ lý học tập cho tài khoản Premium</span>
              </div>
              <div className="landing-metric" role="listitem">
                <strong>Admin</strong>
                <span>Quản trị người dùng và kiểm duyệt nội dung</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="landing-hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="landing-glass-stack">
              {[
                ["#2563eb", "Bảng tin", "Chia sẻ tiến độ học tập, câu hỏi, tài liệu và tương tác với cộng đồng."],
                ["#059669", "Nhắn tin", "Chat cá nhân hoặc nhóm, kèm cuộc gọi khi cần làm việc chung."],
                ["#7c3aed", "Premium AI", "Hỏi trợ lý AI các câu hỏi học tập và nhận gợi ý thực hành tiếp theo."],
              ].map(([color, title, body]) => (
                <div className="landing-mini-card" key={title}>
                  <span className="landing-mini-dot" style={{ background: color }} />
                  <div>
                    <strong>{title}</strong>
                    <p style={{ margin: "6px 0 0", fontSize: "0.88rem", color: "var(--mono-muted)" }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <motion.section id="gioi-thieu" className="landing-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
          <div className="landing-section-head">
            <span className="landing-tag">Tổng quan</span>
            <h2>Edu Social là gì?</h2>
            <p>
              Đây là ứng dụng web mạng xã hội học tập: người dùng có thể đăng bài, bình luận,
              theo dõi nhau, nhắn tin realtime, tạo nhóm, gọi thoại/video, nâng cấp Premium và
              sử dụng AI để hỏi đáp kiến thức.
            </p>
          </div>
          <div className="landing-grid-3">
            {overviewCards.map((card, index) => <LandingCard key={card.title} card={card} index={index} />)}
          </div>
        </motion.section>

        <motion.section className="landing-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
          <div className="landing-section-head">
            <span className="landing-tag">Chức năng chính</span>
            <h2>Các module người dùng nhìn thấy</h2>
            <p>
              Điểm mạnh hiện tại là tập hợp nhiều luồng xã hội và học tập vào cùng một SPA React,
              giúp người dùng không phải chuyển qua nhiều công cụ riêng lẻ.
            </p>
          </div>
          <div className="landing-grid-3">
            {featureCards.map((card, index) => <LandingCard key={card.title} card={card} index={index} />)}
          </div>
        </motion.section>

        <motion.section className="landing-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
          <div className="landing-split">
            <div>
              <div className="landing-section-head" style={{ marginBottom: 20 }}>
                <span className="landing-tag">Chatbot AI</span>
                <h2>AI tập trung vào học tập</h2>
                <p>
                  Chatbot Premium được giới hạn trong phạm vi học tập: giải thích khái niệm,
                  lập kế hoạch ôn tập, tạo câu hỏi luyện tập và đưa phản hồi học thuật ngắn gọn.
                  Nếu chưa cấu hình khóa OpenAI, hệ thống trả thông báo rõ để admin bổ sung.
                </p>
              </div>
              <div className="landing-tech-row">
                <span className="landing-pill">OpenAI Responses API</span>
                <span className="landing-pill">Premium AI</span>
                <span className="landing-pill">Giới hạn nội dung học tập</span>
                <span className="landing-pill">Trả lời tiếng Việt</span>
              </div>
            </div>
            <div className="landing-panel">
              <h3 style={{ fontWeight: 800, fontSize: "1.05rem" }}>Đánh giá nhanh</h3>
              <ul>
                <li><CheckCircle2 size={18} /> Có luồng chatbot riêng trong Tin nhắn.</li>
                <li><CheckCircle2 size={18} /> Có chặn tài khoản chưa bật Premium AI.</li>
                <li><CheckCircle2 size={18} /> Cần hiển thị trạng thái cấu hình AI rõ hơn cho admin.</li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section className="landing-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
          <div className="landing-section-head">
            <span className="landing-tag">Hồ sơ và vận hành</span>
            <h2>Premium, hồ sơ và quản trị</h2>
            <p>
              Phần vận hành đã có nền tảng tốt: hồ sơ cá nhân, trang Premium, xác nhận thanh toán,
              dashboard admin và kiểm duyệt bài viết. Đây là các phần cần kiểm thử kỹ khi demo.
            </p>
          </div>
          <div className="landing-grid-3">
            {adminCards.map((card, index) => <LandingCard key={card.title} card={card} index={index} />)}
          </div>
        </motion.section>

        <motion.section className="landing-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
          <div className="landing-section-head">
            <span className="landing-tag">Bảo mật</span>
            <h2>Những điểm cần chú ý trước khi nộp/demo</h2>
          </div>
          <div className="landing-faq">
            {[
              ["Dữ liệu môi trường", "Không đưa khóa API, MongoDB URL, Stripe secret hoặc token thật lên GitHub."],
              ["Chatbot AI", "Cần kiểm tra tài khoản Premium đã bật aiEnabled và backend có OPENAI_API_KEY hợp lệ."],
              ["Realtime", "Socket.io và PeerJS cần đúng host/port khi chuyển từ localhost sang production."],
              ["Upload ảnh", "Cloudinary preset đang hard-code trong frontend, nên chuyển sang biến môi trường hoặc backend proxy khi triển khai thật."],
            ].map(([q, a]) => (
              <div key={q} className="landing-faq-item">
                <strong>{q}</strong>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section id="cong-nghe" className="landing-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
          <div className="landing-section-head">
            <span className="landing-tag">Nền tảng</span>
            <h2>Công nghệ lõi</h2>
            <p>
              Frontend dùng React 18, Redux Thunk, React Query, React Router v6, Axios, Framer Motion
              và Lucide Icons. Backend dùng Express, MongoDB/Mongoose, Socket.io, PeerJS, Stripe và OpenAI.
            </p>
          </div>
          <div className="landing-panel" style={{ maxWidth: 880 }}>
            <div className="landing-tech-row">
              {["React 18", "Redux + Thunk", "React Query", "Express", "MongoDB", "Socket.io", "PeerJS", "Stripe", "OpenAI"].map((tech) => (
                <span key={tech} className="landing-pill">{tech}</span>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section id="doi-ngu" className="landing-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
          <div className="landing-section-head">
            <span className="landing-tag">Đội ngũ</span>
            <h2>Thành viên phát triển</h2>
            <p>
              Edu Social được xây dựng bởi <strong>Phong, Thông, Quang, Thái, Minh</strong> với mục tiêu
              tạo một trải nghiệm học tập kết nối, hiện đại và dễ mở rộng.
            </p>
          </div>
          <div className="landing-authors">
            {authors.map((author) => (
              <div key={author.name} className="landing-author">
                <div className="landing-author-avatar" aria-hidden>{author.initial}</div>
                <div className="landing-author-name">{author.name}</div>
                <div className="landing-author-role">{author.role}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <section className="landing-cta-band" aria-labelledby="landing-cta-title">
          <h2 id="landing-cta-title">Sẵn sàng tham gia Edu Social?</h2>
          <p>Tạo tài khoản và trải nghiệm bảng tin, tin nhắn realtime, Premium AI và các công cụ học tập.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" className="btn-landing btn-landing-primary">Đăng ký ngay</Link>
            <Link to="/" className="btn-landing btn-landing-ghost" style={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.35)", color: "#fff" }}>
              Đăng nhập
            </Link>
          </div>
        </section>

        <footer className="landing-footer">
          <span>© {new Date().getFullYear()} Edu Social - Landing giới thiệu hệ thống.</span>
          <div className="landing-footer-links">
            <Link to="/">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
            <a href="#top">Về đầu trang</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Landing;
