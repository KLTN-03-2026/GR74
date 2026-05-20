import React from 'react'
import LeftSide from '../../components/message/LeftSide'
import RightSide from '../../components/message/RightSide'

const Conversation = () => {
    return (
        <div className="message message_layout d-flex">
            <div className="col-md-4 border-right px-0 left_mess message_list_panel">
                <LeftSide />
            </div>

            <div className="col-md-8 px-0 right_mess message_chat_panel">
                <RightSide />
            </div>
        </div>
    )
}

export default Conversation
