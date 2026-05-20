import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteDataAPI, getDataAPI } from "../utils/fetchData";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { getErrorMessage } from "../utils/errorMessage";
import AdminShell from "../components/admin/AdminShell";
import pdfIcon from "../images/file-icons/pdf.svg";
import wordIcon from "../images/file-icons/word.svg";
import excelIcon from "../images/file-icons/excel.svg";
import powerpointIcon from "../images/file-icons/powerpoint.svg";
import fileIcon from "../images/file-icons/file.svg";

const documentTypes = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "raw"];
const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
const videoTypes = ["mp4", "mov", "webm", "avi"];

const getExtension = (value = "") => {
  const cleanValue = value.split("?")[0].split("#")[0];
  const lastPart = cleanValue.split("/").pop() || "";
  const ext = lastPart.includes(".") ? lastPart.split(".").pop() : "";
  return ext.toLowerCase();
};

const getMediaItem = (post) => {
  const media = post.images?.[0];
  if (!media) return null;

  const url = typeof media === "string" ? media : media.url || "";
  const name = typeof media === "string" ? url.split("/").pop() : media.name || url.split("/").pop() || "Tệp đính kèm";
  const explicitType = typeof media === "string" ? "" : media.fileType || media.type || "";
  const extension = (explicitType || getExtension(name) || getExtension(url)).toLowerCase();
  const lowerUrl = url.toLowerCase();
  const lowerName = name.toLowerCase();

  if (
    lowerUrl.includes("/image/upload/") ||
    lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?|#|$)/) ||
    lowerName.startsWith("photo-")
  ) {
    return { kind: "image", url, name, extension: extension || "image" };
  }

  if (
    lowerUrl.includes("/video/upload/") ||
    lowerUrl.match(/\.(mp4|mov|webm|avi)(\?|#|$)/)
  ) {
    return { kind: "video", url, name, extension: extension || "video" };
  }

  if (
    lowerUrl.includes("/raw/upload/") ||
    documentTypes.includes(extension)
  ) {
    return { kind: "document", url, name, extension: extension || "file" };
  }

  if (imageTypes.includes(extension)) return { kind: "image", url, name, extension };
  if (videoTypes.includes(extension)) return { kind: "video", url, name, extension };
  if (documentTypes.includes(extension)) return { kind: "document", url, name, extension };
  return { kind: url ? "image" : "none", url, name, extension: extension || "image" };
};

const isVisualMedia = (post) => {
  const media = getMediaItem(post);
  return media?.kind === "image" || media?.kind === "video";
};

const isDocumentMedia = (post) => getMediaItem(post)?.kind === "document";

const getDocumentIcon = (type) => {
  if (type === "pdf") return pdfIcon;
  if (["doc", "docx"].includes(type)) return wordIcon;
  if (["xls", "xlsx"].includes(type)) return excelIcon;
  if (["ppt", "pptx"].includes(type)) return powerpointIcon;
  return fileIcon;
};

const truncate = (value, length = 160) => {
  if (!value) return "Bài viết chỉ có media";
  return value.length > length ? `${value.slice(0, length)}...` : value;
};

const AdminModeration = () => {
  const { auth, socket } = useSelector((state) => state);
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [mediaType, setMediaType] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [confirmPost, setConfirmPost] = useState(null);

  const canManage = auth.user?.role === "admin";

  const stats = useMemo(() => ({
    visible: posts.length,
    premium: posts.filter((post) => post.premium).length,
    standard: posts.filter((post) => !post.premium).length,
    visual: posts.filter(isVisualMedia).length,
    documents: posts.filter(isDocumentMedia).length,
  }), [posts]);

  const loadPosts = async (
    nextPage = page,
    value = search,
    nextFilter = filter,
    nextMediaType = mediaType,
  ) => {
    if (!auth.token || !canManage) return;
    setLoading(true);
    try {
      const url = `admin/posts?page=${nextPage}&limit=12&filter=${nextFilter}&mediaType=${nextMediaType}&search=${encodeURIComponent(value)}`;
      const res = await getDataAPI(url, auth.token);
      setPosts(res.data.posts);
      setPage(res.data.page);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1, "", "all", "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token, canManage]);

  if (!canManage) return <Navigate to="/" replace />;

  const handleSearch = (e) => {
    e.preventDefault();
    loadPosts(1, search, filter, mediaType);
  };

  const changeFilter = (value) => {
    setFilter(value);
    loadPosts(1, search, value, mediaType);
  };

  const changeMediaType = (value) => {
    setMediaType(value);
    loadPosts(1, search, filter, value);
  };

  const removePost = async () => {
    if (!confirmPost) return;

    setRemovingId(confirmPost._id);
    try {
      const res = await deleteDataAPI(`admin/posts/${confirmPost._id}`, auth.token);
      setPosts((current) => current.filter((item) => item._id !== confirmPost._id));
      setTotal((current) => Math.max(current - 1, 0));
      setConfirmPost(null);
      if (socket && socket.emit && res.data.notify) {
        socket.emit("createNotify", res.data.notify);
      }
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg || "Đã xóa bài viết." } });
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    } finally {
      setRemovingId("");
    }
  };

  const renderMedia = (post) => {
    const media = getMediaItem(post);
    if (!media || media.kind === "none") return <span>Không có media</span>;

    if (media.kind === "image") return <img src={media.url} alt={media.name} />;

    if (media.kind === "video") {
      return (
        <video controls>
          <source src={media.url} />
        </video>
      );
    }

    return (
      <a className="moderation_document" href={media.url} target="_blank" rel="noreferrer">
        <img src={getDocumentIcon(media.extension)} alt={`${media.extension} file`} />
        <strong>{media.extension.toUpperCase()}</strong>
        <small>{media.name}</small>
      </a>
    );
  };

  return (
    <AdminShell
      active="moderation"
      title="Kiểm duyệt nội dung"
      subtitle="Xem lại bài viết, kiểm tra tác giả, lọc nội dung Premium và xóa các bài không liên quan đến học tập."
      actions={
        <div className="dashboard_actions">
          <button type="button" onClick={() => loadPosts(page, search, filter, mediaType)} disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
          <Link to="/admin_dashboard">Tổng quan</Link>
        </div>
      }
    >

      <section className="dashboard_metrics moderation_stats">
        <article className="dashboard_metric">
          <span>Tổng kết quả</span>
          <strong>{total}</strong>
          <small>mọi trang</small>
        </article>
        <article className="dashboard_metric">
          <span>Đang hiển thị</span>
          <strong>{stats.visible}</strong>
          <small>trang hiện tại</small>
        </article>
        <article className="dashboard_metric">
          <span>Premium</span>
          <strong>{stats.premium}</strong>
          <small>{stats.standard} bài thường</small>
        </article>
        <article className="dashboard_metric">
          <span>Ảnh / video</span>
          <strong>{stats.visual}</strong>
          <small>media hiển thị trực tiếp</small>
        </article>
        <article className="dashboard_metric">
          <span>Tài liệu</span>
          <strong>{stats.documents}</strong>
          <small>pdf, word, excel, ppt</small>
        </article>
      </section>

      <form className="admin_toolbar moderation_toolbar" onSubmit={handleSearch}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm nội dung, tag, username, họ tên hoặc email"
        />
        <select value={filter} onChange={(e) => changeFilter(e.target.value)}>
          <option value="all">Tất cả bài viết</option>
          <option value="premium">Bài Premium</option>
          <option value="standard">Bài thường</option>
        </select>
        <select value={mediaType} onChange={(e) => changeMediaType(e.target.value)}>
          <option value="all">Mọi loại nội dung</option>
          <option value="media">Ảnh / video</option>
          <option value="document">Tài liệu</option>
          <option value="none">Không có media</option>
        </select>
        <button>{loading ? "Đang tìm..." : "Tìm kiếm"}</button>
      </form>

      <section className="moderation_grid">
        {posts.map((post) => (
          <article key={post._id} className="moderation_post">
            <div className="moderation_media">
              {renderMedia(post)}
            </div>

            <div className="moderation_body">
              <div className="moderation_author">
                <img src={post.user?.avatar} alt={post.user?.username || ""} />
                <div>
                  <strong>{post.user?.username || "không rõ"}</strong>
                  <span>{post.user?.email || post.user?.fullname || "Không có thông tin chủ bài"}</span>
                </div>
              </div>

              <p>{truncate(post.content)}</p>

              <div className="admin_badges">
                <span>{post.premium ? "Premium" : "Thường"}</span>
                <span>{post.likesCount} lượt thích</span>
                <span>{post.commentsCount} bình luận</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>

              {post.tags?.length > 0 && (
                <div className="moderation_tags">
                  {post.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                </div>
              )}

              <button
                type="button"
                className="moderation_remove"
                onClick={() => setConfirmPost(post)}
                disabled={removingId === post._id}
              >
                {removingId === post._id ? "Đang xóa..." : "Xóa bài không phù hợp"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {posts.length === 0 && !loading && (
        <section className="dashboard_panel moderation_empty">
          <h2>Không tìm thấy bài viết</h2>
          <p>Thử từ khóa hoặc bộ lọc khác.</p>
        </section>
      )}

      <div className="moderation_pager">
        <button type="button" disabled={page <= 1 || loading} onClick={() => loadPosts(page - 1, search, filter, mediaType)}>
          Trước
        </button>
        <span>Trang {page} / {pages}</span>
        <button type="button" disabled={page >= pages || loading} onClick={() => loadPosts(page + 1, search, filter, mediaType)}>
          Sau
        </button>
      </div>

      {confirmPost && (
        <div className="admin_confirm_overlay">
          <section className="admin_confirm_modal">
            <span className="material-icons">warning</span>
            <h2>Xác nhận xóa bài viết</h2>
            <p>
              Bạn có chắc muốn xóa bài viết của <strong>{confirmPost.user?.username || "người dùng này"}</strong> không?
              Thao tác này dùng cho nội dung không phù hợp hoặc không liên quan đến học tập.
            </p>
            <div className="admin_confirm_actions">
              <button type="button" onClick={() => setConfirmPost(null)} disabled={Boolean(removingId)}>
                Hủy
              </button>
              <button type="button" onClick={removePost} disabled={Boolean(removingId)}>
                {removingId ? "Đang xóa..." : "Xóa bài viết"}
              </button>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminModeration;
