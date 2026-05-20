/** @format */

import React, { useState, useEffect, useRef } from "react";
import UserCard from "../UserCard";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import MsgDisplay from "./MsgDisplay";
import Icons from "../Icons";
import { GLOBALTYPES } from "../../redux/actions/globalTypes";
import { imageShow, videoShow } from "../../utils/mediaShow";
import { imageUpload } from "../../utils/imageUpload";
import { MESS_TYPES, addMessage, getMessages, loadMoreMessages, deleteConversation } from "../../redux/actions/messageAction";
import { blockUser, unblockUser } from "../../redux/actions/profileAction";
import LoadIcon from "../../images/loading.gif";
import { postDataAPI } from "../../utils/fetchData";
import { getErrorMessage } from "../../utils/errorMessage";

const RightSide = () => {
  const { auth, message, theme, socket, peer } = useSelector((state) => state);
  const dispatch = useDispatch();

  const { id } = useParams();
  const [user, setUser] = useState([]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState([]);
  const [loadMedia, setLoadMedia] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const refDisplay = useRef();
  const pageEnd = useRef();

  const [data, setData] = useState([]);
  const [result, setResult] = useState(9);
  const [page, setPage] = useState(0);
  const [isLoadMore, setIsLoadMore] = useState(0);

  const navigate = useNavigate();
  const isGroup = !!user?.isGroup;
  const isAIChat = !!user?.isAIChat;
  const amIBlocking = !isGroup && !isAIChat && auth.user?.blockedUsers?.some(u => (u._id || u) === user._id);
  const groupRecipients = isGroup ? (user.recipients || []) : [];
  const groupRecipientIds = groupRecipients.map((item) => item._id || item);

  useEffect(() => {
    const newData = message.data.find((item) => item._id === id);
    if (newData) {
      setData(newData.messages);
      setResult(newData.result);
      setPage(newData.page);
    }
  }, [message.data, id]);

  useEffect(() => {
    if (id && message.users.length > 0) {
      setTimeout(() => {
        refDisplay.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 50);

      const newUser = message.users.find((user) => user._id === id);
      if (newUser) setUser(newUser);
    }
  }, [message.users, id]);

  const handleChangeMedia = (e) => {
    const files = [...e.target.files];
    let err = "";
    let newMedia = [];

    files.forEach((file) => {
      if (!file) return (err = "File does not exist.");

      if (file.size > 1024 * 1024 * 5) {
        return (err = "The image/video largest is 5mb.");
      }

      return newMedia.push(file);
    });

    if (err) dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err } });
    setMedia([...media, ...newMedia]);
  };

  const handleDeleteMedia = (index) => {
    const newArr = [...media];
    newArr.splice(index, 1);
    setMedia(newArr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && media.length === 0) return;

    if (isAIChat) {
      if (aiLoading) return;
      if (!auth.user?.aiEnabled) {
        return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Premium AI is not enabled for your account yet." } });
      }

      const messageText = text.trim();
      setText("");
      setAiLoading(true);

      if (message.data.every((item) => item._id !== id)) {
        dispatch({ type: MESS_TYPES.GET_MESSAGES, payload: { _id: id, messages: [], result: 0, page: 1 } });
      }

      dispatch({
        type: MESS_TYPES.ADD_MESSAGE,
        payload: {
          sender: auth.user._id,
          recipient: id,
          text: messageText,
          media: [],
          createdAt: new Date().toISOString(),
        },
      });

      try {
        const res = await postDataAPI("ai-chat/message", { text: messageText }, auth.token);
        const aiReply = res.data.messages?.[1];
        if (aiReply) dispatch({ type: MESS_TYPES.ADD_MESSAGE, payload: { ...aiReply, conversationId: id, recipient: auth.user._id } });
        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
      } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
      } finally {
        setAiLoading(false);
        if (refDisplay.current) {
          refDisplay.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }
      return;
    }

    setText("");
    setMedia([]);
    setLoadMedia(true);

    let newArr = [];
    if (media.length > 0) newArr = await imageUpload(media);

    const msg = {
      sender: auth.user._id,
      recipient: isGroup ? undefined : id,
      conversationId: isGroup ? id : undefined,
      recipients: isGroup ? groupRecipientIds : undefined,
      text,
      media: newArr,
      createdAt: new Date().toISOString(),
    };

    setLoadMedia(false);
    await dispatch(addMessage({ msg, auth, socket }));
    if (refDisplay.current) {
      refDisplay.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    const getMessagesData = async () => {
      if (message.data.every((item) => item._id !== id)) {
        await dispatch(getMessages({ auth, id }));
        setTimeout(() => {
          refDisplay.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 50);
      }
    };
    getMessagesData();
  }, [id, dispatch, auth, message.data]);

  // Load More
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadMore((p) => p + 1);
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(pageEnd.current);
  }, [setIsLoadMore]);

  useEffect(() => {
    if (isLoadMore > 1) {
      if (result >= page * 9) {
        dispatch(loadMoreMessages({ auth, id, page: page + 1 }));
        setIsLoadMore(1);
      }
    }
    // eslint-disable-next-line
  }, [isLoadMore]);

  const handleDeleteConversation = () => {
    if (window.confirm("Do you want to delete?")) {
      dispatch(deleteConversation({ auth, id }));
      return navigate("/message");
    }
  };

  // Call
  const caller = ({ video }) => {
    const { _id, avatar, username, fullname } = user;

    const msg = {
      sender: auth.user._id,
      recipient: isGroup ? undefined : _id,
      conversationId: isGroup ? id : undefined,
      recipients: isGroup ? groupRecipientIds : undefined,
      avatar,
      username: isGroup ? user.name : username,
      fullname: isGroup ? `${groupRecipients.length} members` : fullname,
      video,
    };
    dispatch({ type: GLOBALTYPES.CALL, payload: msg });
  };

  const callUser = ({ video }) => {
    const { _id, avatar, username, fullname } = auth.user;
    const peerId = peer && (peer.id || peer._id);

    if (!socket || !socket.emit) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Realtime socket is not connected." } });
    }

    if (!peer || !peer.open || !peerId) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Call service is not ready. Please try again." } });
    }

    const msg = {
      sender: _id,
      recipient: isGroup ? undefined : user._id,
      conversationId: isGroup ? id : undefined,
      recipients: isGroup ? groupRecipientIds : undefined,
      avatar,
      username,
      fullname,
      video,
      peerId,
      group: isGroup ? { _id: id, name: user.name, recipients: groupRecipientIds } : undefined,
    };

    socket.emit("callUser", msg);
  };

  const handleAudioCall = () => {
    caller({ video: false });
    callUser({ video: false });
  };

  const handleVideoCall = () => {
    caller({ video: true });
    callUser({ video: true });
  };

  return (
    <>
      <div className={`message_header ${isAIChat ? "ai_tutor_header" : ""}`} style={{ cursor: "pointer" }}>
        {user.length !== 0 && (
          isAIChat ? (
            <div className="ai_tutor_head_content">
              <div className="ai_tutor_icon">
                <span className="material-icons">smart_toy</span>
              </div>
              <div className="ai_tutor_title">
                <div>
                  <h2>Premium AI Tutor</h2>
                  <span className="ai_chat_badge">Premium</span>
                </div>
                <p><i className="fas fa-circle" /> Che do tro ly hoc thuat</p>
              </div>
              <div className="ai_tutor_actions">
                <button type="button" title="AI history"><span className="material-icons">history</span></button>
                <button type="button" title="More"><span className="material-icons">more_vert</span></button>
              </div>
            </div>
          ) : (
            <UserCard user={user}>
              <div>
                <i className="fas fa-phone-alt" onClick={handleAudioCall} />

                <i className="fas fa-video mx-3" onClick={handleVideoCall} />

                <i className="fas fa-trash text-danger mr-3" onClick={handleDeleteConversation} />

                {amIBlocking ? (
                  <i className="fas fa-unlock text-success" onClick={() => dispatch(unblockUser({ user, auth }))} title="Bỏ chặn người dùng" style={{ cursor: "pointer" }} />
                ) : (
                  <i className="fas fa-ban text-danger" onClick={() => {
                    if (window.confirm("Bạn có muốn chặn người dùng này không?")) {
                      dispatch(blockUser({ user, auth }));
                    }
                  }} title="Chặn người dùng" style={{ cursor: "pointer" }} />
                )}
              </div>
            </UserCard>
          )
        )}
      </div>

      <div className={`chat_container ${isAIChat ? "ai_tutor_chat" : ""}`} style={{ height: media.length > 0 ? "calc(100% - 180px)" : "" }}>
        <div className="chat_display" ref={refDisplay}>
          <button style={{ marginTop: "-25px", opacity: 0 }} ref={pageEnd}>
            Load more
          </button>

          {data.map((msg, index) => (
            <div key={index}>
              {(msg.sender?._id || msg.sender) !== auth.user._id && (
                <div className="chat_row other_message">
                  <MsgDisplay user={isGroup ? (msg.sender || user) : user} msg={msg} theme={theme} />
                </div>
              )}

              {(msg.sender?._id || msg.sender) === auth.user._id && (
                <div className="chat_row you_message">
                  <MsgDisplay user={auth.user} msg={msg} theme={theme} data={data} conversationData={user} />
                </div>
              )}
            </div>
          ))}

          {loadMedia && (
            <div className="chat_row you_message">
              <img src={LoadIcon} alt="loading" />
            </div>
          )}

          {aiLoading && (
            <div className="chat_row other_message ai_typing">
              <div className="ai_thinking_bubble">
                <span className="material-icons">smart_toy</span>
                <div className="ai_typing_dots"><b></b><b></b><b></b></div>
                <strong>Premium AI is thinking...</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="show_media" style={{ display: !isAIChat && media.length > 0 ? "grid" : "none" }}>
        {media.map((item, index) => (
          <div key={index} id="file_media">
            {item.type.match(/video/i)
              ? videoShow(URL.createObjectURL(item), theme)
              : imageShow(URL.createObjectURL(item), theme)}
            <span onClick={() => handleDeleteMedia(index)}>&times;</span>
          </div>
        ))}
      </div>

      {amIBlocking ? (
        <div className="chat_blocked_banner" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: '#fff1f2',
          borderTop: '1px solid #ffe4e6',
          color: '#e11d48',
          gap: '8px',
          minHeight: '72px'
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            Bạn đã chặn người dùng này.
          </span>
          <button 
            type="button" 
            onClick={() => dispatch(unblockUser({ user, auth }))} 
            style={{
              padding: '6px 16px',
              background: '#e11d48',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Bỏ chặn
          </button>
        </div>
      ) : isAIChat && !auth.user?.aiEnabled ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
          borderTop: '1px solid #ffe4e6',
          color: '#e11d48',
          gap: '12px',
          textAlign: 'center'
        }}>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: "20px" }}>lock</span>
            Tính năng Premium AI đang bị khóa
          </span>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, maxWidth: '440px' }}>
            Hãy nâng cấp lên tài khoản Premium để trò chuyện và nhận hỗ trợ học tập trực tiếp từ Trợ lý AI Tutor 24/7.
          </p>
          <button 
            type="button" 
            onClick={() => navigate("/premium")} 
            style={{
              padding: '8px 24px',
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(225,29,72,0.25)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Nâng cấp Premium ngay
          </button>
        </div>
      ) : (
        <form className={`chat_input ${isAIChat ? "ai_tutor_input" : ""}`} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={isAIChat ? "Ask Premium AI a study question..." : "Enter your message..."}
            value={text}
            disabled={aiLoading}
            onChange={(e) => setText(e.target.value)}
            style={{
              filter: theme ? "invert(1)" : "invert(0)",
              background: theme ? "#040404" : "",
              color: theme ? "white" : "",
            }}
          />

          {isAIChat && (
            <button type="button" className="ai_prompt_chip" onClick={() => setText("Hay giai thich ngan gon va dua vi du thuc te: ")}>
              <span className="material-icons">auto_awesome</span>
              Simplify
            </button>
          )}

          {!isAIChat && <Icons setContent={setText} content={text} theme={theme} />}

          {!isAIChat && <div className="file_upload">
            <i className="fas fa-image text-danger" />
            <input type="file" name="file" id="file" multiple accept="image/*,video/*" onChange={handleChangeMedia} />
          </div>}

          <button type="submit" className="material-icons" disabled={aiLoading || (!text && media.length === 0)}>
            {aiLoading ? "hourglass_top" : "near_me"}
          </button>
        </form>
      )}
    </>
  );
};

export default RightSide;
