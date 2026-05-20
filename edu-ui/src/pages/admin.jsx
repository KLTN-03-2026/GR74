import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { getDataAPI, patchDataAPI } from "../utils/fetchData";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { getErrorMessage } from "../utils/errorMessage";
import AdminShell from "../components/admin/AdminShell";

const editableFields = ["fullname", "username", "email", "role", "aiLearningFocus", "isActive"];

const roleLabels = {
  admin: "Admin",
  user: "Người dùng",
};

const Admin = () => {
  const { auth } = useSelector((state) => state);
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  const canManage = auth.user?.role === "admin";

  const loadUsers = async (searchVal = search, filterRole = roleFilter, pageNum = 1) => {
    if (!auth.token || !canManage) return;
    setLoading(true);
    try {
      let url = `admin/users?limit=${usersPerPage}&page=${pageNum}&search=${encodeURIComponent(searchVal)}`;
      if (filterRole) url += `&role=${filterRole}`;
      const res = await getDataAPI(url, auth.token);
      setUsers(res.data.users);
      setTotalUsers(res.data.total || res.data.users.length);
      setPage(pageNum);
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers("", "", 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token, canManage]);

  const stats = useMemo(() => {
    const active = users.filter((user) => user.isActive !== false).length;
    const admins = users.filter((user) => user.role === "admin").length;
    const aiUsers = users.filter((user) => user.aiEnabled).length;

    return [
      { label: "Tổng tài khoản", value: totalUsers, note: "tất cả kết quả", icon: "groups" },
      { label: "Đang hoạt động", value: active, note: "trang hiện tại", icon: "verified_user" },
      { label: "Quản trị viên", value: admins, note: "có quyền quản trị", icon: "admin_panel_settings" },
      { label: "Đã bật AI", value: aiUsers, note: "trang hiện tại", icon: "smart_toy" },
    ];
  }, [users, totalUsers]);

  if (!canManage) return <Navigate to="/" replace />;

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(search, roleFilter, 1);
  };

  const handleRoleChange = (role) => {
    setRoleFilter(role);
    loadUsers(search, role, 1);
  };

  const beginEdit = (user) => {
    setEditing({
      ...user,
      aiLearningFocus: user.aiLearningFocus || "general",
    });
  };

  const patchUser = async (id, data) => {
    try {
      const res = await patchDataAPI(`admin/users/${id}`, data, auth.token);
      setUsers((current) => current.map((user) => (user._id === id ? res.data.user : user)));
      setEditing(null);
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    }
  };

  const saveEditing = (e) => {
    e.preventDefault();
    const data = {};
    editableFields.forEach((field) => {
      data[field] = editing[field];
    });
    data.aiEnabled = Boolean(editing.aiEnabled);
    patchUser(editing._id, data);
  };

  const handleToggleAi = (user) => {
    patchUser(user._id, { aiEnabled: !user.aiEnabled });
  };

  const handleToggleActive = (user) => {
    patchUser(user._id, { isActive: user.isActive === false });
  };

  const displayStart = totalUsers > 0 ? (page - 1) * usersPerPage + 1 : 0;
  const displayEnd = Math.min(page * usersPerPage, totalUsers);

  return (
    <AdminShell
      active="users"
      title="Quản lý người dùng"
      subtitle="Quản lý tài khoản, vai trò, trạng thái hoạt động và quyền sử dụng AI học tập trong một khu vực vận hành riêng."
      actions={
        <div className="dashboard_actions">
          <button type="button" onClick={() => loadUsers(search, roleFilter, page)} disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      }
    >
      <section className="admin_console_stats">
        {stats.map((item) => (
          <article key={item.label}>
            <span className="material-icons">{item.icon}</span>
            <div>
              <small>{item.label}</small>
              <strong>{item.value}</strong>
              <p>{item.note}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="admin_console_panel">
        <div className="admin_console_panel_head">
          <div>
            <h2>Danh sách tài khoản</h2>
            <p>Đang hiển thị {displayStart}-{displayEnd} trong tổng {totalUsers} người dùng</p>
          </div>

          <form className="admin_console_filters" onSubmit={handleSearch}>
            <label>
              <span className="material-icons">search</span>
              <input
                placeholder="Tìm tên, email hoặc username"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <select value={roleFilter} onChange={(e) => handleRoleChange(e.target.value)}>
              <option value="">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="user">Người dùng</option>
            </select>

            <button type="submit">Tìm kiếm</button>
          </form>
        </div>

        <div className="admin_console_table_wrap">
          <table className="admin_console_table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>AI học tập</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className={user.isActive === false ? "is_disabled" : ""}>
                  <td>
                    <div className="admin_console_user">
                      <img src={user.avatar} alt={user.username} />
                      <div>
                        <strong>{user.fullname || user.username}</strong>
                        <small>@{user.username}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin_console_email">{user.email}</span>
                  </td>
                  <td>
                    <span className={`admin_console_badge ${user.role === "admin" ? "is_admin" : ""}`}>
                      {roleLabels[user.role] || user.role || "Người dùng"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`admin_console_status ${user.isActive !== false ? "is_active" : ""}`}
                      onClick={() => handleToggleActive(user)}
                    >
                      <i />
                      {user.isActive !== false ? "Hoạt động" : "Đã khóa"}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`admin_console_switch ${user.aiEnabled ? "is_on" : ""}`}
                      onClick={() => handleToggleAi(user)}
                      aria-label="Bật tắt AI học tập"
                    >
                      <i />
                    </button>
                  </td>
                  <td>
                    <div className="admin_console_actions">
                      <button type="button" onClick={() => beginEdit(user)} title="Chỉnh sửa người dùng">
                        <span className="material-icons">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="admin_console_empty">Không tìm thấy người dùng.</td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan="6" className="admin_console_empty">Đang tải người dùng...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin_console_pager">
          <span>Trang {page}</span>
          <div>
            <button type="button" onClick={() => loadUsers(search, roleFilter, page - 1)} disabled={page <= 1 || loading}>
              <span className="material-icons">chevron_left</span>
            </button>
            <button type="button" onClick={() => loadUsers(search, roleFilter, page + 1)} disabled={displayEnd >= totalUsers || loading}>
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {editing && (
        <div className="admin_console_modal">
          <form className="admin_console_editor" onSubmit={saveEditing}>
            <div className="admin_console_editor_head">
              <div>
                <span>Hồ sơ người dùng</span>
                <h2>Chỉnh sửa tài khoản</h2>
              </div>
              <button type="button" onClick={() => setEditing(null)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="admin_console_editor_user">
              <img src={editing.avatar} alt={editing.username} />
              <div>
                <strong>{editing.fullname || editing.username}</strong>
                <small>@{editing.username}</small>
              </div>
            </div>

            <label>
              Họ và tên
              <input type="text" value={editing.fullname || ""} onChange={(e) => setEditing({ ...editing, fullname: e.target.value })} />
            </label>

            <label>
              Username
              <input type="text" value={editing.username || ""} onChange={(e) => setEditing({ ...editing, username: e.target.value })} />
            </label>

            <label>
              Email
              <input type="email" value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            </label>

            <label>
              Vai trò
              <select value={editing.role || "user"} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                <option value="user">Người dùng</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label>
              Định hướng AI
              <input
                type="text"
                value={editing.aiLearningFocus || ""}
                onChange={(e) => setEditing({ ...editing, aiLearningFocus: e.target.value })}
                placeholder="Ví dụ: Công nghệ phần mềm"
              />
            </label>

            <div className="admin_console_checks">
              <label>
                <input
                  type="checkbox"
                  checked={editing.isActive !== false}
                  onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                />
                Tài khoản đang hoạt động
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(editing.aiEnabled)}
                  onChange={(e) => setEditing({ ...editing, aiEnabled: e.target.checked })}
                />
                Bật AI học tập
              </label>
            </div>

            <div className="admin_console_editor_actions">
              <button type="button" onClick={() => setEditing(null)}>Hủy</button>
              <button type="submit">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
};

export default Admin;
