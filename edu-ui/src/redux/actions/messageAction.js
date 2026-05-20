import { GLOBALTYPES, DeleteData } from '../actions/globalTypes'
import { postDataAPI, getDataAPI, deleteDataAPI, patchDataAPI } from '../../utils/fetchData'
import { getErrorMessage } from '../../utils/errorMessage'

export const MESS_TYPES = {
    ADD_USER: 'ADD_USER',
    ADD_MESSAGE: 'ADD_MESSAGE',
    GET_CONVERSATIONS: 'GET_CONVERSATIONS',
    GET_MESSAGES: 'GET_MESSAGES',
    UPDATE_MESSAGES: 'UPDATE_MESSAGES',
    DELETE_MESSAGES: 'DELETE_MESSAGES',
    DELETE_CONVERSATION: 'DELETE_CONVERSATION',
    CREATE_GROUP: 'CREATE_GROUP',
    UPDATE_GROUP: 'UPDATE_GROUP',
    CHECK_ONLINE_OFFLINE: 'CHECK_ONLINE_OFFLINE',
    RECALL_MESSAGE: 'RECALL_MESSAGE'
}

const GROUP_AVATAR = 'https://res.cloudinary.com/EduSocialchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'

export const getAIChatAssistant = ({auth}) => async (dispatch) => {
    try {
        const res = await getDataAPI('ai-chat/assistant', auth.token)
        dispatch({type: MESS_TYPES.ADD_USER, payload: res.data.user})
        return res.data.user
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}})
        return null
    }
}



export const addMessage = ({msg, auth, socket}) => async (dispatch) =>{
    dispatch({type: MESS_TYPES.ADD_MESSAGE, payload: msg})

    const { _id, avatar, fullname, username } = auth.user
    if(socket && socket.emit){
        socket.emit('addMessage', {...msg, user: { _id, avatar, fullname, username } })
    }
    
    try {
        await postDataAPI('message', msg, auth.token)
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}})
    }
}

export const recallMessage = ({msg, auth, socket, conversationData}) => async (dispatch) => {
    // Optimistic update: đánh dấu recalled ngay trên UI
    dispatch({ type: MESS_TYPES.RECALL_MESSAGE, payload: { _id: msg._id, recipient: msg.recipient, conversationId: msg.conversationId } })

    try {
        await patchDataAPI(`message/${msg._id}/recall`, {}, auth.token)

        // Emit socket để người kia thấy ngay
        if (socket && socket.emit) {
            const recallData = {
                messageId: msg._id,
                sender: auth.user._id,
                recipient: msg.recipient,
                conversationId: msg.conversationId,
                recipients: conversationData?.recipients?.map(r => r._id || r)
            }
            socket.emit('recallMessage', recallData)
        }
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } })
    }
}

export const createGroup = ({name, recipients, auth, socket}) => async (dispatch) => {
    try {
        const res = await postDataAPI('groups', {name, recipients}, auth.token)
        const group = {
            ...res.data.group,
            _id: res.data.group._id,
            username: res.data.group.name,
            fullname: `${res.data.group.recipients.length} members`,
            avatar: res.data.group.avatar || GROUP_AVATAR,
            text: '',
            media: [],
            isGroup: true
        }
        dispatch({type: MESS_TYPES.CREATE_GROUP, payload: group})
        if(socket && socket.emit) {
            socket.emit('createGroup', {
                ...group,
                recipients: res.data.group.recipients.map(user => user._id)
            })
        }
        return group
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}})
        return null
    }
}

export const updateGroup = ({id, data, auth}) => async (dispatch) => {
    try {
        const res = await patchDataAPI(`groups/${id}`, data, auth.token)
        const group = {
            ...res.data.group,
            username: res.data.group.name,
            fullname: `${res.data.group.recipients.length} members`,
            avatar: res.data.group.avatar || GROUP_AVATAR,
            isGroup: true
        }
        dispatch({type: MESS_TYPES.UPDATE_GROUP, payload: group})
        return group
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}})
        return null
    }
}

export const getConversations = ({auth, page = 1}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`conversations?limit=${page * 9}`, auth.token)
        
        let newArr = [];
        res.data.conversations.forEach(item => {
            if(item.isGroup){
                newArr.push({
                    ...item,
                    username: item.name,
                    fullname: `${item.recipients.length} members`,
                    avatar: item.avatar || GROUP_AVATAR,
                    text: item.text,
                    media: item.media,
                    call: item.call,
                    isGroup: true
                })
            }else{
                item.recipients.forEach(cv => {
                    if(cv._id !== auth.user._id){
                        newArr.push({...cv, text: item.text, media: item.media, call: item.call, isGroup: false})
                    }
                })
            }
        })

        dispatch({
            type: MESS_TYPES.GET_CONVERSATIONS, 
            payload: {newArr, result: res.data.result}
        })

    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}})
    }
}

export const getMessages = ({auth, id, page = 1}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`message/${id}?limit=${page * 9}`, auth.token)
        const newData = {...res.data, messages: res.data.messages.reverse()}

        dispatch({type: MESS_TYPES.GET_MESSAGES, payload: {...newData, _id: id, page}})
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}})
    }
}

export const loadMoreMessages = ({auth, id, page = 1}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`message/${id}?limit=${page * 9}`, auth.token)
        const newData = {...res.data, messages: res.data.messages.reverse()}

        dispatch({type: MESS_TYPES.UPDATE_MESSAGES, payload: {...newData, _id: id, page}})
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}})
    }
}

export const deleteMessages = ({msg, data, auth}) => async (dispatch) => {
    const newData = DeleteData(data, msg._id)
    dispatch({type: MESS_TYPES.DELETE_MESSAGES, payload: {newData, _id: msg.recipient}})
    try {
        await deleteDataAPI(`message/${msg._id}`, auth.token)
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}})
    }
}

export const deleteConversation = ({auth, id}) => async (dispatch) => {
    dispatch({type: MESS_TYPES.DELETE_CONVERSATION, payload: id})
    try {
        await deleteDataAPI(`conversation/${id}`, auth.token)
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}})
    }
}
