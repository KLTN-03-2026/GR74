import { MESS_TYPES } from '../actions/messageAction'
import { EditData, DeleteData } from '../actions/globalTypes'

const initialState = {
    users: [],
    resultUsers: 0,
    data: [],
    firstLoad: false
}

const messageReducer = (state = initialState, action) => {
    switch (action.type){
        case MESS_TYPES.ADD_USER:
            if(state.users.every(item => item._id !== action.payload._id)){
                return {
                    ...state,
                    users: [action.payload, ...state.users]
                };
            }
            return {
                ...state,
                users: state.users.map(item => item._id === action.payload._id ? {...item, ...action.payload} : item)
                    .sort((a, b) => Number(Boolean(b.isAIChat)) - Number(Boolean(a.isAIChat)))
            };
        case MESS_TYPES.ADD_MESSAGE:
            return {
                ...state,
                data: state.data.map(item => 
                    item._id === action.payload.conversationId || item._id === action.payload.recipient || item._id === action.payload.sender 
                    ? {
                        ...item,
                        messages: [...item.messages, action.payload],
                        result: item.result + 1
                    }
                    : item
                ),
                users: state.users.map(user => 
                    user._id === action.payload.conversationId || user._id === action.payload.recipient || user._id === action.payload.sender
                    ? {
                        ...user, 
                        text: action.payload.text, 
                        media: action.payload.media,
                        call: action.payload.call
                    }
                    : user
                )
            };
        case MESS_TYPES.CREATE_GROUP:
            if(state.users.every(item => item._id !== action.payload._id)){
                return {
                    ...state,
                    users: [action.payload, ...state.users]
                }
            }
            return state;
        case MESS_TYPES.UPDATE_GROUP:
            return {
                ...state,
                users: EditData(state.users, action.payload._id, action.payload)
            };
        case MESS_TYPES.GET_CONVERSATIONS:
            return {
                ...state,
                users: [
                    ...state.users.filter(user => user.isAIChat),
                    ...action.payload.newArr.filter(user => state.users.every(item => !item.isAIChat || item._id !== user._id))
                ],
                resultUsers: action.payload.result,
                firstLoad: true
            };
        case MESS_TYPES.GET_MESSAGES:
            if(state.data.some(item => item._id === action.payload._id)){
                return {
                    ...state,
                    data: EditData(state.data, action.payload._id, action.payload)
                };
            }
            return {
                ...state,
                data: [...state.data, action.payload]
            };
        case MESS_TYPES.UPDATE_MESSAGES:
            return {
                ...state,
                data: EditData(state.data, action.payload._id, action.payload)
            };
        case MESS_TYPES.DELETE_MESSAGES:
            return {
                ...state,
                data: state.data.map(item => 
                    item._id === action.payload._id
                    ? {...item, messages: action.payload.newData}
                    : item
                )
            };
        case MESS_TYPES.RECALL_MESSAGE:
            return {
                ...state,
                data: state.data.map(conv => ({
                    ...conv,
                    messages: conv.messages.map(m =>
                        m._id === action.payload._id
                        ? { ...m, recalled: true, text: '', media: [] }
                        : m
                    )
                }))
            };
        case MESS_TYPES.DELETE_CONVERSATION:
            return {
                ...state,
                users: DeleteData(state.users, action.payload),
                data: DeleteData(state.data, action.payload)
            };
        case MESS_TYPES.CHECK_ONLINE_OFFLINE:
            return {
                ...state,
                users: state.users.map(user => 
                    action.payload.includes(user._id)
                    ? {...user, online: true}
                    : {...user, online: false}
                )
            };
        default:
            return state;
    }
}

export default messageReducer;
