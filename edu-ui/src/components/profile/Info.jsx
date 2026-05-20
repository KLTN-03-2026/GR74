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
import { AtSign, Bot, Edit3, Link as LinkIcon, Mail, MapPin, MessageCircle, Phone, Share2, Sparkles, BadgeCheck } from 'lucide-react'

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
        <section className="info">
            {
                userData.map(user => (
                    <div className="info_container" key={user._id}>
                        <div className="profile_cover">
                            <div className="profile_cover_content">
                                <span><Sparkles size={16} /> Hồ sơ Edu Social</span>
                                <strong>{user.aiEnabled ? 'Đã bật Premium AI' : 'Thành viên cộng đồng học tập'}</strong>
                            </div>
                        </div>

                        <div className="profile_body">
                            <div className="profile_identity_row">
                                <div className="profile_identity">
                                    <div className="profile_avatar_wrap">
                                        <Avatar src={user.avatar} size="supper-avatar" />
                                    </div>
                                    <div className="profile_name_block">
                                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {user.fullname || user.username}
                                            {user.aiEnabled && (
                                                <BadgeCheck 
                                                    size={22} 
                                                    fill="#1877f2" 
                                                    color="#ffffff" 
                                                    style={{ flexShrink: 0 }}
                                                    title="Hội viên Premium" 
                                                />
                                            )}
                                        </h2>
                                        <p><AtSign size={16} />{user.username}</p>
                                    </div>
                                </div>

                                <div className="profile_actions">
                                    {
                                        user._id === auth.user._id
                                        ? <button className="profile_edit_btn"
                                            onClick={() => setOnEdit(true)}>
                                            <Edit3 size={17} />
                                            Sửa hồ sơ
                                          </button>

                                        : <>
                                            <FriendBtn user={user} />
                                            <button
                                                className="profile_edit_btn"
                                                style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', border: 'none' }}
                                                onClick={() => {
                                                    dispatch({ type: MESS_TYPES.ADD_USER, payload: { ...user, text: '', media: [] } })
                                                    navigate(`/message/${user._id}`)
                                                }}
                                            >
                                                <MessageCircle size={16} />
                                                Nhắn tin
                                            </button>
                                          </>
                                    }
                                    <button className="profile_share_btn" type="button">
                                        <Share2 size={17} />
                                        Chia sẻ
                                    </button>
                                </div>
                            </div>

                            <p className="profile_story">
                                {user.story || 'Sinh viên yêu thích học tập, chia sẻ kiến thức và kết nối cùng cộng đồng Edu Social.'}
                            </p>

                            <div className="follow_btn">
                                <span onClick={() => setShowFriends(true)}>
                                    <strong>{user.friends?.length || 0}</strong>
                                    Bạn bè
                                </span>
                                <span onClick={() => setShowFollowing(true)}>
                                    <strong>{user.following?.length || 0}</strong>
                                    Đang theo dõi
                                </span>
                                <span onClick={() => setShowFollowers(true)}>
                                    <strong>{user.followers?.length || 0}</strong>
                                    Người theo dõi
                                </span>
                                <span>
                                    <strong>{user.saved?.length || 0}</strong>
                                    Đã lưu
                                </span>
                                <span>
                                    <strong>{user.aiEnabled ? 'AI' : 'Miễn phí'}</strong>
                                    Gói
                                </span>
                            </div>

                            <div className="profile_meta">
                                {user.mobile && <span><Phone size={16} />{user.mobile}</span>}
                                {user.address && <span><MapPin size={16} />{user.address}</span>}
                                {user.email && <span><Mail size={16} />{user.email}</span>}
                                {user.website && (
                                    <a href={user.website} target="_blank" rel="noreferrer">
                                        <LinkIcon size={16} />{user.website}
                                    </a>
                                )}
                                {user.aiEnabled && <span><Bot size={16} />Premium AI</span>}
                            </div>
                        </div>

                        {
                            onEdit && <EditProfile setOnEdit={setOnEdit} />
                        }

                        {
                            showFollowers &&
                            <Followers 
                            users={user.followers} 
                            setShowFollowers={setShowFollowers} 
                            />
                        }
                        {
                            showFollowing &&
                            <Following 
                            users={user.following} 
                            setShowFollowing={setShowFollowing} 
                            />
                        }
                        {
                            showFriends &&
                            <Friends 
                            users={user.friends} 
                            setShowFriends={setShowFriends} 
                            />
                        }
                    </div>
                ))
            }
        </section>
    )
}

export default Info
