import { POST_TYPES } from '../actions/postAction'
import { EditData } from '../actions/globalTypes'

const detailPostReducer = (state = [], action) => {
    switch (action.type){
        case POST_TYPES.GET_POST:
            // Prevent duplicate: only add if not already in the array
            if (state.find(p => p._id === action.payload._id)) {
                return EditData(state, action.payload._id, action.payload)
            }
            return [...state, action.payload]
        case POST_TYPES.UPDATE_POST:
            return EditData(state, action.payload._id, action.payload)
        case POST_TYPES.DELETE_POST:
            return state.filter(post => post._id !== action.payload._id)
        default:
            return state;
    }
}


export default detailPostReducer