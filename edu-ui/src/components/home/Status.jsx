import React from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, PenLine, Sparkles } from 'lucide-react'
import Avatar from '../Avatar'
import { useSelector, useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'

const Status = () => {
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()

    return (
        <motion.div
            className="status my-3 d-flex"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Avatar src={auth.user.avatar} size="big-avatar" />

            <div className="status_composer">
                <button className="statusBtn"
                onClick={() => dispatch({ type: GLOBALTYPES.STATUS, payload: true })}>
                    <PenLine size={18} />
                    <span>{auth.user.username}, share a learning update...</span>
                </button>
                <div className="status_quick_actions">
                    <button type="button" onClick={() => dispatch({ type: GLOBALTYPES.STATUS, payload: true })}>
                        <ImagePlus size={16} /> Media
                    </button>
                    <button type="button" onClick={() => dispatch({ type: GLOBALTYPES.STATUS, payload: true })}>
                        <Sparkles size={16} /> AI note
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export default Status
