import React, { useEffect } from 'react'
import { getErrorMessage } from '../../utils/errorMessage'

const typeConfig = {
    success: {
        icon: 'check_circle',
        label: 'Thành công',
        className: 'app_toast_success',
    },
    error: {
        icon: 'error',
        label: 'Có lỗi xảy ra',
        className: 'app_toast_error',
    },
}

const Toast = ({ msg, handleShow, type }) => {
    const variant = typeConfig[type] || typeConfig.success
    const body = getErrorMessage(msg.body, 'Không có nội dung thông báo.')
    const title = msg.title || variant.label

    useEffect(() => {
        const timer = setTimeout(handleShow, 4500)
        return () => clearTimeout(timer)
    }, [handleShow])

    return (
        <div className={`app_toast ${variant.className}`} role="alert" aria-live="assertive">
            <div className="app_toast_icon">
                <span className="material-icons">{variant.icon}</span>
            </div>

            <div className="app_toast_content">
                <strong>{title}</strong>
                <p>{body}</p>
            </div>

            <button type="button" className="app_toast_close" onClick={handleShow} aria-label="Đóng thông báo">
                <span className="material-icons">close</span>
            </button>
        </div>
    )
}

export default Toast
