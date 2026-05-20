import { GLOBALTYPES, DeleteData } from './globalTypes'
import { getDataAPI, patchDataAPI } from '../../utils/fetchData'
import { imageUpload } from '../../utils/imageUpload'
import { createNotify, removeNotify } from '../actions/notifyAction'
import { getErrorMessage } from '../../utils/errorMessage'


export const PROFILE_TYPES = {
    LOADING: 'LOADING_PROFILE',
    GET_USER: 'GET_PROFILE_USER',
    FOLLOW: 'FOLLOW',
    UNFOLLOW: 'UNFOLLOW',
    GET_ID: 'GET_PROFILE_ID',
    GET_POSTS: 'GET_PROFILE_POSTS',
    UPDATE_POST: 'UPDATE_PROFILE_POST',
    FRIEND: 'FRIEND'
}


export const getProfileUsers = ({id, auth}) => async (dispatch) => {
    try {
        dispatch({type: PROFILE_TYPES.LOADING, payload: true})
        const res = getDataAPI(`/user/${id}`, auth.token)
        const res1 = getDataAPI(`/user_posts/${id}`, auth.token)
        
        const users = await res;
        const posts = await res1;

        dispatch({
            type: PROFILE_TYPES.GET_USER,
            payload: users.data
        })

        dispatch({
            type: PROFILE_TYPES.GET_POSTS,
            payload: {...posts.data, _id: id, page: 2}
        })

        dispatch({type: PROFILE_TYPES.GET_ID, payload: id})

        dispatch({type: PROFILE_TYPES.LOADING, payload: false})
    } catch (err) {
        dispatch({type: PROFILE_TYPES.LOADING, payload: false})
        dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: {error: getErrorMessage(err)}
        })
    }
    
}


export const updateProfileUser = ({userData, avatar, auth}) => async (dispatch) => {
    if(!userData.fullname)
    return dispatch({type: GLOBALTYPES.ALERT, payload: {error: "Please add your full name."}})

    if(userData.fullname.length > 25)
    return dispatch({type: GLOBALTYPES.ALERT, payload: {error: "Your full name too long."}})

    if(userData.story.length > 200)
    return dispatch({type: GLOBALTYPES.ALERT, payload: {error: "Your story too long."}})

    try {
        let media;
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})

        if(avatar) media = await imageUpload([avatar])

        const res = await patchDataAPI("user", {
            ...userData,
            avatar: avatar ? media[0].url : auth.user.avatar
        }, auth.token)

        dispatch({
            type: GLOBALTYPES.AUTH,
            payload: {
                ...auth,
                user: {
                    ...auth.user, ...userData,
                    avatar: avatar ? media[0].url : auth.user.avatar,
                }
            }
        })

        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: {error: getErrorMessage(err)}
        })
    }
}

export const follow = ({users, user, auth, socket}) => async (dispatch) => {
    let newUser;
    
    if(users.every(item => item._id !== user._id)){
        newUser = {...user, followers: [...user.followers, auth.user]}
    }else{
        users.forEach(item => {
            if(item._id === user._id){
                newUser = {...item, followers: [...item.followers, auth.user]}
            }
        })
    }

    dispatch({ type: PROFILE_TYPES.FOLLOW, payload: newUser })

    dispatch({
        type: GLOBALTYPES.AUTH, 
        payload: {
            ...auth,
            user: {...auth.user, following: [...auth.user.following, newUser]}
        }
    })


    try {
        const res = await patchDataAPI(`user/${user._id}/follow`, null, auth.token)
        socket.emit('follow', res.data.newUser)

        // Notify
        const isAccepting = auth.user.followers.some(f => f._id === newUser._id);
        const msg = {
            id: auth.user._id,
            text: isAccepting ? 'đã chấp nhận lời mời kết bạn của bạn.' : 'đã gửi cho bạn một lời mời kết bạn.',
            recipients: [newUser._id],
            url: `/profile/${auth.user._id}`,
        }

        dispatch(createNotify({msg, auth, socket}))

    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: {error: getErrorMessage(err)}
        })
    }
}

export const unfollow = ({users, user, auth, socket}) => async (dispatch) => {

    let newUser;

    if(users.every(item => item._id !== user._id)){
        newUser = {...user, followers: DeleteData(user.followers, auth.user._id)}
    }else{
        users.forEach(item => {
            if(item._id === user._id){
                newUser = {...item, followers: DeleteData(item.followers, auth.user._id)}
            }
        })
    }

    dispatch({ type: PROFILE_TYPES.UNFOLLOW, payload: newUser })

    dispatch({
        type: GLOBALTYPES.AUTH, 
        payload: {
            ...auth,
            user: { 
                ...auth.user, 
                following: DeleteData(auth.user.following, newUser._id) 
            }
        }
    })
   

    try {
        const res = await patchDataAPI(`user/${user._id}/unfollow`, null, auth.token)
        socket.emit('unFollow', res.data.newUser)

        // Notify
        const msg = {
            id: auth.user._id,
            text: 'has started to follow you.',
            recipients: [newUser._id],
            url: `/profile/${auth.user._id}`,
        }

        dispatch(removeNotify({msg, auth, socket}))

    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: {error: getErrorMessage(err)}
        })
    }
}

export const addFriend = ({user, auth, socket}) => async (dispatch) => {
    // Optimistic UI update for auth
    const newUser = {...user, friendRequests: [...(user.friendRequests || []), auth.user._id]};
    dispatch({ type: PROFILE_TYPES.FRIEND, payload: newUser })
    dispatch({
        type: GLOBALTYPES.AUTH, 
        payload: { ...auth, user: {...auth.user, sentRequests: [...(auth.user.sentRequests || []), newUser]} }
    })
    try {
        const res = await patchDataAPI(`user/${user._id}/add_friend`, null, auth.token)
        const msg = {
            id: auth.user._id, text: 'đã gửi cho bạn một lời mời kết bạn.',
            recipients: [newUser._id], url: `/profile/${auth.user._id}`,
        }
        dispatch(createNotify({msg, auth, socket}))
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)} })
    }
}

export const cancelFriendRequest = ({user, auth, socket}) => async (dispatch) => {
    const newUser = {...user, friendRequests: DeleteData(user.friendRequests || [], auth.user._id)};
    dispatch({ type: PROFILE_TYPES.FRIEND, payload: newUser })
    dispatch({
        type: GLOBALTYPES.AUTH, 
        payload: { ...auth, user: {...auth.user, sentRequests: DeleteData(auth.user.sentRequests || [], newUser._id)} }
    })
    try {
        await patchDataAPI(`user/${user._id}/cancel_friend`, null, auth.token)
        const msg = {
            id: auth.user._id, text: 'đã gửi cho bạn một lời mời kết bạn.',
            recipients: [newUser._id], url: `/profile/${auth.user._id}`,
        }
        dispatch(removeNotify({msg, auth, socket}))
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)} })
    }
}

export const acceptFriend = ({user, auth, socket}) => async (dispatch) => {
    const newUser = {
        ...user, 
        sentRequests: DeleteData(user.sentRequests || [], auth.user._id),
        friends: [...(user.friends || []), auth.user._id]
    };
    dispatch({ type: PROFILE_TYPES.FRIEND, payload: newUser })
    dispatch({
        type: GLOBALTYPES.AUTH, 
        payload: { 
            ...auth, 
            user: {
                ...auth.user, 
                friendRequests: DeleteData(auth.user.friendRequests || [], newUser._id),
                friends: [...(auth.user.friends || []), newUser]
            } 
        }
    })
    try {
        await patchDataAPI(`user/${user._id}/accept_friend`, null, auth.token)
        const msg = {
            id: auth.user._id, text: 'đã chấp nhận lời mời kết bạn của bạn.',
            recipients: [newUser._id], url: `/profile/${auth.user._id}`,
        }
        dispatch(createNotify({msg, auth, socket}))
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)} })
    }
}

export const rejectFriend = ({user, auth}) => async (dispatch) => {
    const newUser = {...user, sentRequests: DeleteData(user.sentRequests || [], auth.user._id)};
    dispatch({ type: PROFILE_TYPES.FRIEND, payload: newUser })
    dispatch({
        type: GLOBALTYPES.AUTH, 
        payload: { ...auth, user: {...auth.user, friendRequests: DeleteData(auth.user.friendRequests || [], newUser._id)} }
    })
    try {
        await patchDataAPI(`user/${user._id}/reject_friend`, null, auth.token)
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)} })
    }
}

export const unfriend = ({user, auth}) => async (dispatch) => {
    const newUser = {...user, friends: DeleteData(user.friends || [], auth.user._id)};
    dispatch({ type: PROFILE_TYPES.FRIEND, payload: newUser })
    dispatch({
        type: GLOBALTYPES.AUTH, 
        payload: { ...auth, user: {...auth.user, friends: DeleteData(auth.user.friends || [], newUser._id)} }
    })
    try {
        await patchDataAPI(`user/${user._id}/unfriend`, null, auth.token)
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)} })
    }
}

export const blockUser = ({user, auth}) => async (dispatch) => {
    dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
    try {
        const res = await patchDataAPI(`user/${user._id}/block`, null, auth.token)
        dispatch({
            type: GLOBALTYPES.AUTH,
            payload: { ...auth, user: res.data.newUser }
        })
        
        // Update the target profile user state to reset follow/friend status
        const updatedUser = {
            ...user,
            followers: DeleteData(user.followers || [], auth.user._id),
            friends: DeleteData(user.friends || [], auth.user._id),
            friendRequests: DeleteData(user.friendRequests || [], auth.user._id),
            sentRequests: DeleteData(user.sentRequests || [], auth.user._id)
        }
        dispatch({ type: PROFILE_TYPES.GET_USER, payload: { users: [updatedUser] } })

        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)} })
    }
}

export const unblockUser = ({user, auth}) => async (dispatch) => {
    dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
    try {
        const res = await patchDataAPI(`user/${user._id}/unblock`, null, auth.token)
        dispatch({
            type: GLOBALTYPES.AUTH,
            payload: { ...auth, user: res.data.newUser }
        })
        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)} })
    }
}
