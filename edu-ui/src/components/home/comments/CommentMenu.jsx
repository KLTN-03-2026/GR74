import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteComment } from '../../../redux/actions/commentAction'

const CommentMenu = ({post, comment, setOnEdit}) => {

    const { auth, socket } = useSelector(state => state)
    const dispatch = useDispatch()
    const postUserId = post.user?._id
    const commentUserId = comment.user?._id

    const handleRemove = () => {
        if(postUserId === auth.user._id || commentUserId === auth.user._id){
            dispatch(deleteComment({post, auth, comment, socket}))
        }
    }

    const MenuItem = () => {
        return(
            <>
                <div className="dropdown-item" onClick={() => setOnEdit(true)}>
                    <span className="material-icons">create</span> Edit
                </div>
                <div className="dropdown-item" onClick={handleRemove}>
                    <span className="material-icons">delete_outline</span> Remove
                </div>
            </>
        )
    }


    return (
        <div className="menu">
            {
                (postUserId === auth.user._id || commentUserId === auth.user._id) &&
                <div className="nav-item dropdown">
                    <span className="material-icons" id="moreLink" data-toggle="dropdown">
                        more_vert
                    </span>

                    <div className="dropdown-menu" aria-labelledby="moreLink">
                        {
                            postUserId === auth.user._id
                            ? commentUserId === auth.user._id
                                ? MenuItem()
                                : <div className="dropdown-item" onClick={handleRemove}>
                                    <span className="material-icons">delete_outline</span> Remove
                                </div>
                            : commentUserId === auth.user._id && MenuItem()
                        }
                    </div>

                </div>
            }
            
        </div>
    )
}

export default CommentMenu
