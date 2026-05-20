/** @format */

import React, { useState } from "react";
import Avatar from "../../Avatar";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { GLOBALTYPES } from "../../../redux/actions/globalTypes";
import { deletePost } from "../../../redux/actions/postAction";
import { BASE_URL } from "../../../utils/config";
import { postDataAPI } from "../../../utils/fetchData";
import { getErrorMessage } from "../../../utils/errorMessage";

const reportReasons = [
  { value: "off_topic", label: "Không liên quan đến học tập" },
  { value: "spam", label: "Spam hoặc quảng cáo" },
  { value: "abuse", label: "Nội dung xúc phạm / độc hại" },
  { value: "fake", label: "Thông tin sai lệch" },
  { value: "copyright", label: "Vi phạm bản quyền" },
  { value: "other", label: "Lý do khác" },
];

const getCategoryStyle = (category) => {
  if (category === "Hỏi đáp") {
    return { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" };
  }
  if (category === "Tài liệu") {
    return { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" };
  }
  return { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" };
};

const CardHeader = ({ post }) => {
  const { auth, socket } = useSelector((state) => state);
  const dispatch = useDispatch();
  const author = post.user || {};
  const postId = post._id || post.id;
  const authorName = author.fullname || author.username || "Người dùng";
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("off_topic");
  const [reportDetail, setReportDetail] = useState("");
  const [reporting, setReporting] = useState(false);

  const navigate = useNavigate();

  const handleEditPost = () => {
    dispatch({ type: GLOBALTYPES.STATUS, payload: { ...post, onEdit: true } });
  };

  const handleDeletePost = () => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này không?")) {
      dispatch(deletePost({ post, auth, socket }));
      return navigate("/");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${BASE_URL}/post/${postId}`);
  };

  const handleReportPost = async (e) => {
    e.preventDefault();
    if (!postId) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Không xác định được bài viết cần báo cáo." } });
      return;
    }

    setReporting(true);
    try {
      const res = await postDataAPI(
        `posts/${postId}/report`,
        { reason: reportReason, detail: reportDetail },
        auth.token,
      );
      setShowReport(false);
      setReportDetail("");
      setReportReason("off_topic");
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="card_header">
      <div className="d-flex">
        <Avatar src={author.avatar} size="big-avatar" />

        <div className="card_name">
          <h6 className="m-0">
            <Link to={`/profile/${author._id}`} className="text-dark">
              {authorName}
            </Link>
            {post.premium && <span className="premium_tag">premium</span>}
            {post.category && (
              <span
                className="post_category_badge"
                style={{
                  marginLeft: "8px",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  ...getCategoryStyle(post.category),
                }}
              >
                {post.category}
              </span>
            )}
          </h6>
          <small className="text-muted">{moment(post.createdAt).fromNow()}</small>
        </div>
      </div>

      <div className="nav-item dropdown">
        <span className="material-icons" id="moreLink" data-toggle="dropdown">
          more_horiz
        </span>

        <div className="dropdown-menu">
          {auth.user._id === author._id && (
            <>
              <div className="dropdown-item" onClick={handleEditPost}>
                <span className="material-icons">create</span> Sửa bài viết
              </div>
              <div className="dropdown-item" onClick={handleDeletePost}>
                <span className="material-icons">delete_outline</span> Xóa bài viết
              </div>
            </>
          )}

          <div className="dropdown-item" onClick={handleCopyLink}>
            <span className="material-icons">content_copy</span> Sao chép liên kết
          </div>

          {auth.user._id !== author._id && (
            <div className="dropdown-item text-danger" onClick={() => setShowReport(true)}>
              <span className="material-icons">flag</span> Báo cáo bài viết
            </div>
          )}
        </div>
      </div>

      {showReport && (
        <div className="post_report_overlay">
          <form className="post_report_modal" onSubmit={handleReportPost}>
            <div className="post_report_head">
              <span className="material-icons">flag</span>
              <div>
                <h3>Báo cáo bài viết</h3>
                <p>Admin sẽ xem xét nội dung này trước khi xử lý.</p>
              </div>
            </div>

            <label>
              Lý do báo cáo
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                {reportReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Mô tả thêm
              <textarea
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
                maxLength={500}
                placeholder="Nhập thêm chi tiết để admin dễ xem xét..."
              />
            </label>

            <div className="post_report_actions">
              <button type="button" onClick={() => setShowReport(false)} disabled={reporting}>
                Hủy
              </button>
              <button type="submit" disabled={reporting}>
                {reporting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CardHeader;
