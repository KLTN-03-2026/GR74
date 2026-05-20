import { GLOBALTYPES } from '../actions/globalTypes'

const msgToastReducer = (state = [], action) => {
    switch(action.type){
        case GLOBALTYPES.MSG_TOAST:
            if(!action.payload) return []
            // Giới hạn tối đa 3 toast cùng lúc
            return [action.payload, ...state].slice(0, 3)
        case 'REMOVE_MSG_TOAST':
            return state.filter(t => t.id !== action.payload)
        default:
            return state
    }
}

export default msgToastReducer
