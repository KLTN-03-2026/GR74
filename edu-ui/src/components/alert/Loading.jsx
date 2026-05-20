import React from 'react'

const Loading = () => {
    return (
        <div className="app_loading_overlay">
            <div className="app_loading_card">
                <span className="app_loading_spinner" />
                <strong>Đang xử lý</strong>
                <p>Vui lòng chờ trong giây lát...</p>
            </div>
        </div>
    )
}

export default Loading
