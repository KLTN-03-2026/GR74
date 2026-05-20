import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { POST_TYPES } from './redux/actions/postAction'
import { GLOBALTYPES } from './redux/actions/globalTypes'
import { NOTIFY_TYPES } from './redux/actions/notifyAction'
import { MESS_TYPES } from './redux/actions/messageAction'
import { logout } from './redux/actions/authAction'

import audiobell from './audio/got-it-done-613.mp3'


const spawnNotification = (body, icon, url, title) => {
    let options = {
        body, icon
    }
    let n = new Notification(title, options)

    n.onclick = e => {
        e.preventDefault()
        window.open(url, '_blank')
    }
}

const SocketClient = () => {
    const { auth, socket, notify, online, call } = useSelector(state => state)
    const dispatch = useDispatch()

    const audioRef = useRef()

    // joinUser
    useEffect(() => {
        if(!socket || !socket.emit || !auth.user?._id) return;
        socket.emit('joinUser', auth.user)
    },[socket, auth.user])

    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('accountDeactivated', () => {
            dispatch({type: GLOBALTYPES.ALERT, payload: {error: 'Your account has been deactivated.'}})
            dispatch(logout())
        })

        return () => socket.off('accountDeactivated')
    },[socket, dispatch])

    // Likes
    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('likeToClient', newPost =>{
            dispatch({type: POST_TYPES.UPDATE_POST, payload: newPost})
        })

        return () => socket.off('likeToClient')
    },[socket, dispatch])

    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('unLikeToClient', newPost =>{
            dispatch({type: POST_TYPES.UPDATE_POST, payload: newPost})
        })

        return () => socket.off('unLikeToClient')
    },[socket, dispatch])


    // Comments
    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('createCommentToClient', newPost =>{
            dispatch({type: POST_TYPES.UPDATE_POST, payload: newPost})
        })

        return () => socket.off('createCommentToClient')
    },[socket, dispatch])

    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('deleteCommentToClient', newPost =>{
            dispatch({type: POST_TYPES.UPDATE_POST, payload: newPost})
        })

        return () => socket.off('deleteCommentToClient')
    },[socket, dispatch])


    // Follow
    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('followToClient', newUser =>{
            dispatch({type: GLOBALTYPES.AUTH, payload: {...auth, user: newUser}})
        })

        return () => socket.off('followToClient')
    },[socket, dispatch, auth])

    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('unFollowToClient', newUser =>{
            dispatch({type: GLOBALTYPES.AUTH, payload: {...auth, user: newUser}})
        })

        return () => socket.off('unFollowToClient')
    },[socket, dispatch, auth])


    // Notification
    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('createNotifyToClient', msg =>{
            dispatch({type: NOTIFY_TYPES.CREATE_NOTIFY, payload: msg})

            if(notify.sound) audioRef.current.play()
            spawnNotification(
                msg.user.username + ' ' + msg.text,
                msg.user.avatar,
                msg.url,
                'Edu Social'
            )
        })

        return () => socket.off('createNotifyToClient')
    },[socket, dispatch, notify.sound])

    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('removeNotifyToClient', msg =>{
            dispatch({type: NOTIFY_TYPES.REMOVE_NOTIFY, payload: msg})
        })

        return () => socket.off('removeNotifyToClient')
    },[socket, dispatch])


    // Message
    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('addMessageToClient', msg => {
            const payload = msg.conversationId && msg.user
                ? {...msg, sender: msg.user}
                : msg

            dispatch({type: MESS_TYPES.ADD_MESSAGE, payload})

            if(!msg.conversationId){
                dispatch({
                    type: MESS_TYPES.ADD_USER, 
                    payload: {
                        ...msg.user, 
                        text: msg.text, 
                        media: msg.media
                    }
                })
            }

            // Hiển thị toast thông báo tin nhắn mới (chỉ khi người khác gửi)
            const sender = msg.user || msg.sender
            if(sender && sender._id !== auth.user?._id) {
                dispatch({ type: GLOBALTYPES.MSG_TOAST, payload: {
                    id: Date.now() + Math.random(),
                    senderId: sender._id,
                    senderName: sender.fullname || sender.username || 'Người dùng',
                    avatar: sender.avatar,
                    text: msg.text || '',
                    media: msg.media || []
                }})
                if(notify.sound) audioRef.current?.play()
            }
        })

        return () => socket.off('addMessageToClient')
    },[socket, dispatch, auth.user, notify.sound])

    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('createGroupToClient', group =>{
            dispatch({type: MESS_TYPES.CREATE_GROUP, payload: group})
        })

        return () => socket.off('createGroupToClient')
    },[socket, dispatch])

    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('recallMessageToClient', data => {
            dispatch({ type: MESS_TYPES.RECALL_MESSAGE, payload: { _id: data.messageId } })
        })

        return () => socket.off('recallMessageToClient')
    },[socket, dispatch])

    // Check User Online / Offline
    useEffect(() => {
        if(!socket || !socket.emit || !auth.user?._id) return;
        socket.emit('checkUserOnline', auth.user)
    },[socket, auth.user])

    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('checkUserOnlineToMe', data =>{
            data.forEach(item => {
                if(!online.includes(item.id)){
                    dispatch({type: GLOBALTYPES.ONLINE, payload: item.id})
                }
            })
        })

        return () => socket.off('checkUserOnlineToMe')
    },[socket, dispatch, online])

    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('checkUserOnlineToClient', id =>{
            if(!online.includes(id)){
                dispatch({type: GLOBALTYPES.ONLINE, payload: id})
            }
        })

        return () => socket.off('checkUserOnlineToClient')
    },[socket, dispatch, online])

    // Check User Offline
    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('CheckUserOffline', id =>{
            dispatch({type: GLOBALTYPES.OFFLINE, payload: id})
        })

        return () => socket.off('CheckUserOffline')
    },[socket, dispatch])


    // Call User
    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('callUserToClient', data =>{
            dispatch({type: GLOBALTYPES.CALL, payload: data})
        })

        return () => socket.off('callUserToClient')
    },[socket, dispatch])

    useEffect(() => {
        if(!socket || !socket.on) return;
        socket.on('userBusy', data =>{
            dispatch({type: GLOBALTYPES.ALERT, payload: {error: `${call.username} is busy!`}})
        })

        return () => socket.off('userBusy')
    },[socket, dispatch, call])



    return (
        <>
            <audio controls ref={audioRef} style={{display: 'none'}} >
                <source src={audiobell} type="audio/mp3" />
            </audio>
        </>
    )
}

export default SocketClient
