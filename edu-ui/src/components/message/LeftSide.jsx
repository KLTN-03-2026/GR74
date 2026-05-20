/** @format */

import React, { useState, useEffect, useRef } from "react";
import UserCard from "../UserCard";
import { useSelector, useDispatch } from "react-redux";
import { getDataAPI } from "../../utils/fetchData";
import { GLOBALTYPES } from "../../redux/actions/globalTypes";
import { useNavigate, useParams } from "react-router-dom";
import { MESS_TYPES, getAIChatAssistant, getConversations } from "../../redux/actions/messageAction";
import GroupModal from "./GroupModal";
import { getErrorMessage } from "../../utils/errorMessage";

const LeftSide = () => {
  const { auth, message, online } = useSelector((state) => state);
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [tab, setTab] = useState("chats"); // 'chats' or 'friends'

  const navigate = useNavigate();
  const { id } = useParams();

  const pageEnd = useRef();
  const [page, setPage] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return setSearchUsers([]);

    try {
      const res = await getDataAPI(`search?username=${search}`, auth.token);
      setSearchUsers(res.data.users);
    } catch (err) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: getErrorMessage(err) },
      });
    }
  };

  const handleAddUser = (user) => {
    setSearch("");
    setSearchUsers([]);
    dispatch({ type: MESS_TYPES.ADD_USER, payload: { ...user, text: user.text || "", media: user.media || [] } });
    dispatch({ type: MESS_TYPES.CHECK_ONLINE_OFFLINE, payload: online });
    return navigate(`/message/${user._id}`);
  };

  const isActive = (user) => {
    if (id === user._id) return "active";
    return "";
  };

  useEffect(() => {
    if (!auth.token) return;
    dispatch(getAIChatAssistant({ auth }));
  }, [dispatch, auth]);

  useEffect(() => {
    if (message.firstLoad) return;
    dispatch(getConversations({ auth }));
  }, [dispatch, auth, message.firstLoad]);

  // Load More
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (pageEnd.current) {
      observer.observe(pageEnd.current);
    }
  }, [setPage, tab]); // re-observe if tab changes

  useEffect(() => {
    if (message.resultUsers >= (page - 1) * 9 && page > 1) {
      dispatch(getConversations({ auth, page }));
    }
  }, [message.resultUsers, page, auth, dispatch]);

  // Check User Online - Offline
  useEffect(() => {
    if (message.firstLoad) {
      dispatch({ type: MESS_TYPES.CHECK_ONLINE_OFFLINE, payload: online });
    }
  }, [online, message.firstLoad, dispatch]);

  // Get actual friends array from new system
  const friends = auth.user?.friends || [];

  // Phân loại tin nhắn
  const friendChats = message.users.filter(u => u.isAIChat || u.isGroup || friends.some(f => f._id === u._id || f === u._id));
  const strangerChats = message.users.filter(u => !u.isAIChat && !u.isGroup && !friends.some(f => f._id === u._id || f === u._id));

  return (
    <>
      <div className="message_list_title">
        <div>
          <span>Academic Hub</span>
          <h2>Messages</h2>
        </div>

        <button type="button" className="group_new_btn" onClick={() => setShowGroupModal(true)} title="Tạo nhóm chat">
          <span className="material-icons">group_add</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '0 20px', marginBottom: '16px' }}>
        <button
          onClick={() => setTab("chats")}
          style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: '10px',
            background: tab === 'chats' ? '#eff4ff' : 'transparent',
            color: tab === 'chats' ? '#1d4ed8' : '#64748b',
            fontWeight: tab === 'chats' ? 800 : 600,
            transition: 'all 0.2s', cursor: 'pointer', fontSize: '0.8rem'
          }}
        >
          Trò chuyện
        </button>
        <button
          onClick={() => setTab("strangers")}
          style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: '10px',
            background: tab === 'strangers' ? '#fff1f2' : 'transparent',
            color: tab === 'strangers' ? '#e11d48' : '#64748b',
            fontWeight: tab === 'strangers' ? 800 : 600,
            transition: 'all 0.2s', cursor: 'pointer', fontSize: '0.8rem'
          }}
        >
          Người lạ {strangerChats.length > 0 && `(${strangerChats.length})`}
        </button>
        <button
          onClick={() => setTab("friends")}
          style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: '10px',
            background: tab === 'friends' ? '#eff4ff' : 'transparent',
            color: tab === 'friends' ? '#1d4ed8' : '#64748b',
            fontWeight: tab === 'friends' ? 800 : 600,
            transition: 'all 0.2s', cursor: 'pointer', fontSize: '0.8rem'
          }}
        >
          Bạn bè
        </button>
      </div>

      {(tab === "chats" || tab === "strangers") && (
        <form className="message_header message_search_header" onSubmit={handleSearch}>
          <span className="material-icons message_search_icon">search</span>
          <input
            type="text"
            value={search}
            placeholder="Tìm kiếm trò chuyện"
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" style={{ display: "none" }}>Search</button>
        </form>
      )}

      <div className="message_chat_list">
        {tab === "chats" ? (
          searchUsers.length !== 0 ? (
            <>
              {searchUsers.map((user) => (
                <div key={user._id} className={`message_user ${isActive(user)}`} onClick={() => handleAddUser(user)}>
                  <UserCard user={user} />
                </div>
              ))}
            </>
          ) : (
            <>
              {friendChats.map((user) => (
                <div key={user._id} className={`message_user ${user.isAIChat ? "ai_chat_pinned" : ""} ${isActive(user)}`} onClick={() => handleAddUser(user)}>
                  <UserCard user={user} msg={true}>
                    {user.isAIChat ? (
                      <span className="ai_chat_badge">AI</span>
                    ) : user.online ? (
                      <i className="fas fa-circle text-success" />
                    ) : (
                      friends.some((item) => item._id === user._id || item === user._id) && <i className="fas fa-circle" />
                    )}
                  </UserCard>
                </div>
              ))}
              <button ref={pageEnd} style={{ opacity: 0 }}>Load More</button>
            </>
          )
        ) : tab === "strangers" ? (
          /* Tab Người lạ */
          <>
            {strangerChats.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px', fontSize: '0.9rem' }}>
                Không có tin nhắn từ người lạ.
              </p>
            ) : (
              strangerChats.map((user) => (
                <div key={user._id} className={`message_user ${isActive(user)}`} onClick={() => handleAddUser(user)}>
                  <UserCard user={user} msg={true}>
                    {user.online && <i className="fas fa-circle text-success" />}
                  </UserCard>
                </div>
              ))
            )}
            <button ref={pageEnd} style={{ opacity: 0 }}>Load More</button>
          </>
        ) : (
          /* Tab Bạn bè */
          <>
            {friends.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px', fontSize: '0.9rem' }}>
                Bạn chưa kết bạn với ai.
              </p>
            ) : (
              friends.map((user) => (
                <div key={user._id} className={`message_user ${isActive(user)}`} onClick={() => handleAddUser(user)}>
                  <UserCard user={user}>
                    {online.includes(user._id) ? (
                       <i className="fas fa-circle text-success" style={{ fontSize: '10px' }} />
                    ) : (
                       <i className="fas fa-circle" style={{ fontSize: '10px', color: '#cbd5e1' }} />
                    )}
                  </UserCard>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {showGroupModal && <GroupModal onClose={() => setShowGroupModal(false)} />}
    </>
  );
};

export default LeftSide;
