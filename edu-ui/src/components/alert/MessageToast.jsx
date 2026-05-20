import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'

const REMOVE = 'REMOVE_MSG_TOAST'
const DISPLAY_MS = 5000

const SingleMessageToast = ({ toast, onClose }) => {
    useEffect(() => {
        const t = setTimeout(() => onClose(toast.id), DISPLAY_MS)
        return () => clearTimeout(t)
    }, [toast.id, onClose])

    const preview = toast.media?.length
        ? '📎 Đã gửi ảnh / file'
        : toast.text
        ? toast.text.length > 60
            ? toast.text.slice(0, 60) + '…'
            : toast.text
        : '…'

    return (
        <div className="msg_toast_item" role="alert" aria-live="polite">
            <Link
                to={`/message/${toast.senderId}`}
                className="msg_toast_link"
                onClick={() => onClose(toast.id)}
            >
                <div className="msg_toast_avatar_wrap">
                    <img
                        src={toast.avatar || '/default_avatar.png'}
                        alt={toast.senderName}
                        className="msg_toast_avatar"
                        onError={e => { e.target.src = 'https://res.cloudinary.com/EduSocialchannel/image/upload/v1602752402/avatar/avatar_cugq40.png' }}
                    />
                    <span className="msg_toast_dot" aria-hidden="true" />
                </div>
                <div className="msg_toast_body">
                    <strong className="msg_toast_name">{toast.senderName}</strong>
                    <p className="msg_toast_preview">{preview}</p>
                </div>
            </Link>
            <button
                type="button"
                className="msg_toast_close"
                onClick={() => onClose(toast.id)}
                aria-label="Đóng thông báo"
            >
                <span className="material-icons">close</span>
            </button>
            <div className="msg_toast_progress" style={{ animationDuration: `${DISPLAY_MS}ms` }} />
        </div>
    )
}

const MessageToast = () => {
    const { msgToast } = useSelector(state => state)
    const dispatch = useDispatch()
    const location = useLocation()

    const handleClose = (id) => {
        dispatch({ type: REMOVE, payload: id })
    }

    // Không hiện toast khi đang ở trang nhắn tin
    if (location.pathname.startsWith('/message')) return null
    if (!msgToast || msgToast.length === 0) return null

    return (
        <div className="msg_toast_container" aria-label="Thông báo tin nhắn">
            {msgToast.map(toast => (
                <SingleMessageToast key={toast.id} toast={toast} onClose={handleClose} />
            ))}
        </div>
    )
}

export default MessageToast
