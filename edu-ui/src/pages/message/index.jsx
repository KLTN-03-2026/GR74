import React from 'react'
import LeftSide from '../../components/message/LeftSide'

const Message = () => {
    return (
        <div className="message message_layout d-flex">
            <div className="col-md-4 border-right px-0 left_mess message_list_panel">
                <LeftSide />
            </div>

            <div className="col-md-8 px-0 right_mess message_chat_panel">
                <div className="message_empty_state d-flex justify-content-center 
                align-items-center flex-column h-100">

                    <span className="material-icons">forum</span>
                    <h4>Edu Social Messages</h4>
                    <p>Chon mot hoi thoai de bat dau chat realtime, goi audio/video hoac hoi Premium AI.</p>

                </div>
            </div>
        </div>
    )
}

export default Message
