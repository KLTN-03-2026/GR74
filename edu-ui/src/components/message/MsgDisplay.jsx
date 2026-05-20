import React, { useState, useRef, useEffect } from 'react'
import Avatar from '../Avatar'
import { imageShow, videoShow } from '../../utils/mediaShow'
import { useSelector, useDispatch } from 'react-redux'
import { deleteMessages, recallMessage } from '../../redux/actions/messageAction'
import Times from './Times'

const MsgDisplay = ({user, msg, theme, data, conversationData}) => {
    const { auth, socket } = useSelector(state => state)
    const dispatch = useDispatch()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef()
    const isMe = user._id === auth.user._id

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleDeleteMessages = () => {
        setMenuOpen(false)
        if(!data) return;
        if(window.confirm('Xoá tin nhắn này (chỉ xoá phía bạn)?')){
            dispatch(deleteMessages({msg, data, auth}))
        }
    }

    const handleRecall = () => {
        setMenuOpen(false)
        if(window.confirm('Thu hồi tin nhắn này với tất cả mọi người?')){
            dispatch(recallMessage({ msg, auth, socket, conversationData }))
        }
    }

    return (
        <>
            <div className="chat_title">
                <Avatar src={user.avatar} size="small-avatar" />
                <span>{user.username}</span>
            </div>

            <div className="you_content">
                {/* Context menu button — chỉ hiện khi hover vào bubble */}
                {isMe && !msg.recalled && (
                    <div className="msg_menu_wrap" ref={menuRef}>
                        <button
                            type="button"
                            className="msg_menu_btn"
                            onClick={() => setMenuOpen(v => !v)}
                            title="Tuỳ chọn tin nhắn"
                        >
                            <span className="material-icons">expand_more</span>
                        </button>
                        {menuOpen && (
                            <div className="msg_menu_dropdown">
                                <button type="button" className="msg_menu_item msg_menu_recall" onClick={handleRecall}>
                                    <span className="material-icons">undo</span>
                                    Thu hồi tin nhắn
                                </button>
                                <button type="button" className="msg_menu_item msg_menu_delete" onClick={handleDeleteMessages}>
                                    <span className="material-icons">delete_outline</span>
                                    Xoá (phía tôi)
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div>
                    {msg.recalled ? (
                        <div className="chat_recalled">
                            <span className="material-icons">undo</span>
                            Tin nhắn đã được thu hồi
                        </div>
                    ) : (
                        <>
                            {msg.text && 
                                <div className="chat_text"
                                style={{filter: theme ? 'invert(1)' : 'invert(0)'}}>
                                    {msg.text}
                                </div>
                            }
                            {(msg.media || []).map((item, index) => (
                                <div key={index}>
                                    {
                                        item.url.match(/video/i)
                                        ? videoShow(item.url, theme)
                                        : imageShow(item.url, theme)
                                    }
                                </div>
                            ))}
                        </>
                    )}
                </div>
            
                {msg.call &&
                    <button className="btn call_summary d-flex align-items-center py-3">

                        <span className="material-icons font-weight-bold mr-1"
                        style={{ 
                            fontSize: '2.5rem',
                            filter: theme ? 'invert(1)' : 'invert(0)'
                        }}>
                            {
                                msg.call.times === 0
                                ? msg.call.video ? 'videocam_off' : 'phone_disabled'
                                : msg.call.video ? 'video_camera_front' : 'call'
                            }
                        </span>

                        <div className="text-left">
                            <h6>{msg.call.video ? 'Video Call' : 'Audio Call'}</h6>
                            <small>
                                {
                                    msg.call.times > 0 
                                    ? <Times total={msg.call.times} />
                                    : new Date(msg.createdAt).toLocaleTimeString()
                                }
                            </small>
                        </div>

                    </button>
                }
            
            </div>

            <div className="chat_time">
                {new Date(msg.createdAt).toLocaleString()}
            </div>
        </>
    )
}

export default MsgDisplay
