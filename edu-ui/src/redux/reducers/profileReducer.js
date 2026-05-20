import { PROFILE_TYPES } from '../actions/profileAction'
import { POST_TYPES } from '../actions/postAction'
import { EditData } from '../actions/globalTypes'

const initialState = {
    loading: false,
    ids: [],
    users: [],
    posts: []
}

const profileReducer = (state = initialState, action) => {
    switch (action.type){
        case PROFILE_TYPES.LOADING:
            return {
                ...state,
                loading: action.payload
            };
        case PROFILE_TYPES.GET_USER:
            return {
                ...state,
                users: [...state.users, action.payload.user]
            };
        case PROFILE_TYPES.FOLLOW:
        case PROFILE_TYPES.UNFOLLOW:
        case PROFILE_TYPES.FRIEND:
            return {
                ...state,
                users: EditData(state.users, action.payload._id, action.payload)
            };
        case PROFILE_TYPES.GET_ID:
            return {
                ...state,
                ids: [...state.ids, action.payload]
            };
        case PROFILE_TYPES.GET_POSTS:
            return {
                ...state,
                posts: [...state.posts, action.payload]
            };
        case PROFILE_TYPES.UPDATE_POST:
            return {
                ...state,
                posts: EditData(state.posts, action.payload._id, action.payload)
            };
        case POST_TYPES.CREATE_POST:
            return {
                ...state,
                posts: state.posts.map(item => {
                    const userId = action.payload.user._id || action.payload.user;
                    return item._id === userId
                        ? {
                            ...item,
                            posts: [action.payload, ...item.posts],
                            result: item.result + 1
                        }
                        : item;
                })
            };
        case POST_TYPES.UPDATE_POST:
            return {
                ...state,
                posts: state.posts.map(item => {
                    const userId = action.payload.user._id || action.payload.user;
                    return item._id === userId
                        ? {
                            ...item,
                            posts: EditData(item.posts, action.payload._id, action.payload)
                        }
                        : item;
                })
            };
        case POST_TYPES.DELETE_POST:
            return {
                ...state,
                posts: state.posts.map(item => {
                    const userId = action.payload.user._id || action.payload.user;
                    return item._id === userId
                        ? {
                            ...item,
                            posts: item.posts.filter(post => post._id !== action.payload._id),
                            result: item.result - 1
                        }
                        : item;
                })
            };
        default:
            return state;
    }
}

export default profileReducer