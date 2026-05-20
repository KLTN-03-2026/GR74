import React, { useState, useEffect } from 'react'
import Avatar from '../Avatar'
import EditProfile from './EditProfile'
import FollowBtn from '../FollowBtn'
import FriendBtn from '../FriendBtn'
import Followers from './Followers'
import Following from './Following'
import Friends from './Friends'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { MESS_TYPES } from '../../redux/actions/messageAction'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Bot, Edit3, Link as LinkIcon, Mail, MapPin, MessageCircle, Phone, Share2, Sparkles } from 'lucide-react'

const Info = ({id, auth, profile, dispatch}) => {
    const [userData, setUserData] = useState([])
    const [onEdit, setOnEdit] = useState(false)
    const [showFollowers, setShowFollowers] = useState(false)
    const [showFollowing, setShowFollowing] = useState(false)
    const [showFriends, setShowFriends] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if(id === auth.user._id){
            if (!auth.user) return
            setUserData([auth.user])
        }else{
            const newData = profile.users.filter(user => user._id === id)
            if (!newData?.[0]) return
            setUserData([newData[0]])
        }
    }, [id, auth, dispatch, profile.users])

    useEffect(() => {
        if(showFollowers || showFollowing || showFriends || onEdit){
            dispatch({ type: GLOBALTYPES.MODAL, payload: true})
        }else{
            dispatch({ type: GLOBALTYPES.MODAL, payload: false})
        }
    },[showFollowers, showFollowing, showFriends, onEdit, dispatch])

    return (
        <section className="pf_info">
            {userData.map(user => (
                <div className="pf_card" key={user._id}>

                    {/* Cover */}
                    <div className="pf_cover">
                        {user.aiEnabled && (
                            <span className="pf_cover_badge">
                                <Sparkles size={13} /> Premium AI
                            </span>
                        )}
                    </div>

                    {/* Body */}
                    <div className="pf_body">
                        <div className="pf_top_row">
                            <div className="pf_avatar_wrap">
                                <Avatar src={user.avatar} size="supper-avatar" />
                            </div>
                            <div className="pf_actions">
                                {user._id === auth.user._id
                                    ? <button className="pf_btn pf_btn_outline" onClick={() => setOnEdit(true)}>
                                        <Edit3 size={16} /> Sửa hồ sơ
                                      </button>
                                    : <>
                                        <FriendBtn user={user} />
                                        <button
                                            className="pf_btn pf_btn_primary"
                                            onClick={() => {
                                                dispatch({ type: MESS_TYPES.ADD_USER, payload: {...user, text:'', media:[]} })
                                                navigate(`/message/${user._id}`)
                                            }}
                                        >
                                            <MessageCircle size={16} /> Nhắn tin
                                        </button>
                                      </>
                                }
                                <button className="pf_btn pf_btn_ghost" type="button">
                                    <Share2 size={16} /> Chia sẻ
                                </button>
                            </div>
                        </div>

                        <div className="pf_identity">
                            <h2>
                                {user.fullname || user.username}
                                {user.aiEnabled && (
                                    <BadgeCheck size={22} fill="#1877f2" color="#fff" title="Premium AI" />
                                )}
                            </h2>
                            <p className="pf_username">@ {user.username}</p>
                        </div>

                        {(user.story) && (
                            <p className="pf_story">
                                {user.story || 'Sinh viên yêu thích học tập, chia sẻ kiến thức và kết nối cùng cộng đồng Edu Social.'}
                            </p>
                        )}

                        <div className="pf_stats">
                            <button type="button" className="pf_stat" onClick={() => setShowFriends(true)}>
                                <strong>{user.friends?.length || 0}</strong>
                                <span>Bạn bè</span>
                            </button>
                            <button type="button" className="pf_stat" onClick={() => setShowFollowing(true)}>
                                <strong>{user.following?.length || 0}</strong>
                                <span>Đang theo dõi</span>
                            </button>
                            <button type="button" className="pf_stat" onClick={() => setShowFollowers(true)}>
                                <strong>{user.followers?.length || 0}</strong>
                                <span>Người theo dõi</span>
                            </button>
                            <div className="pf_stat">
                                <strong>{user.saved?.length || 0}</strong>
                                <span>Đã lưu</span>
                            </div>
                        </div>

                        {(user.mobile || user.address || user.email || user.website || user.aiEnabled) && (
                            <div className="pf_meta">
                                {user.mobile && <span><Phone size={14} />{user.mobile}</span>}
                                {user.address && <span><MapPin size={14} />{user.address}</span>}
                                {user.email && <span><Mail size={14} />{user.email}</span>}
                                {user.website && (
                                    <a href={user.website} target="_blank" rel="noreferrer">
                                        <LinkIcon size={14} />{user.website}
                                    </a>
                                )}
                                {user.aiEnabled && (
                                    <span className="pf_ai_tag"><Bot size={14} /> Premium AI</span>
                                )}
                            </div>
                        )}
                    </div>

                    {onEdit && <EditProfile setOnEdit={setOnEdit} />}
                    {showFollowers && <Followers users={user.followers} setShowFollowers={setShowFollowers} />}
                    {showFollowing && <Following users={user.following} setShowFollowing={setShowFollowing} />}
                    {showFriends && <Friends users={user.friends} setShowFriends={setShowFriends} />}
                </div>
            ))}
        </section>
    )
}

export default Info
