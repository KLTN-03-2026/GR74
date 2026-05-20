import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RefreshCw, Sparkles, UsersRound } from 'lucide-react'

import FriendBtn from '../FriendBtn'
import Avatar from '../Avatar'
import LoadIcon from '../../images/loading.gif'
import { getSuggestions } from '../../redux/actions/suggestionsAction'

const RightSideBar = () => {
    const { auth, suggestions } = useSelector(state => state)
    const dispatch = useDispatch()

    // Những người đã gửi lời mời kết bạn (Pending Requests)
    // Redux store will contain the populated friendRequests array or array of IDs.
    // If it's an array of objects, we can map over it directly.
    const pendingRequests = auth.user?.friendRequests || []

    return (
        <aside className="home_sidebar mt-3">
            <section className="sidebar_panel sidebar_profile_panel">
                <div className="sidebar_profile_head">
                    <Avatar src={auth.user.avatar} size="big-avatar" />
                    <div>
                        <h2>{auth.user.username}</h2>
                        <p>{auth.user.fullname}</p>
                    </div>
                </div>
                <div className="sidebar_profile_stats">
                    <span><strong>{auth.user?.following?.length || 0}</strong> following</span>
                    <span><strong>{auth.user?.followers?.length || 0}</strong> followers</span>
                    <span><strong>{auth.user?.saved?.length || 0}</strong> saved</span>
                </div>
            </section>

            {/* Lời mời kết bạn */}
            {pendingRequests.length > 0 && (
                <section className="sidebar_panel" style={{ marginBottom: '24px', borderColor: '#bfdbfe', background: '#f8fafc' }}>
                    <div className="sidebar_panel_head">
                        <div>
                            <span style={{ color: '#2563eb' }}><UsersRound size={16} /> Yêu cầu</span>
                            <h5>Lời mời kết bạn</h5>
                        </div>
                        <span style={{ 
                            background: '#ef4444', color: '#fff', 
                            fontSize: '0.75rem', fontWeight: 800, 
                            padding: '2px 8px', borderRadius: '999px' 
                        }}>
                            {pendingRequests.length} mới
                        </span>
                    </div>
                    <div className="suggestions">
                        {pendingRequests.map(user => (
                            <div className="suggestion_item" key={user._id} style={{ borderColor: '#dbeafe' }}>
                                <div className="suggestion_user">
                                    <Avatar src={user.avatar} size="medium-avatar" />
                                    <div>
                                        <strong>{user.username}</strong>
                                        <span>{user.fullname}</span>
                                    </div>
                                    <FriendBtn user={user} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="sidebar_panel">
                <div className="sidebar_panel_head">
                    <div>
                        <span><UsersRound size={16} /> Mạng lưới</span>
                        <h5>Gợi ý kết bạn</h5>
                    </div>
                    {
                        !suggestions.loading &&
                        <button type="button" onClick={ () => dispatch(getSuggestions(auth.token)) }>
                            <RefreshCw size={16} />
                        </button>
                    }
                </div>

                {
                    suggestions.loading
                    ? <img src={LoadIcon} alt="loading" className="d-block mx-auto my-4" />
                    : <div className="suggestions">
                        {
                            suggestions.users.map(user => (
                                <div className="suggestion_item" key={user._id}>
                                    <div className="suggestion_user">
                                        <Avatar src={user.avatar} size="medium-avatar" />
                                        <div>
                                            <strong>{user.username}</strong>
                                            <span>{user.fullname}</span>
                                        </div>
                                        <FriendBtn user={user} />
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                }
            </section>

            <section className="sidebar_panel sidebar_tip">
                <Sparkles size={18} />
                <div>
                    <strong>Learning tip</strong>
                    <p>Post a short summary after each lesson to help your network learn with you.</p>
                </div>
            </section>

            <div className="home_footer_note" >
                <small>
                   &copy; 2026 Edu Social FROM Edu Social VIET NAM
                </small>
            </div>

        </aside>
    )
}

export default RightSideBar
