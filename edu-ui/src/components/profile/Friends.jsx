import React from 'react'
import UserCard from '../UserCard'
import FriendBtn from '../FriendBtn'
import { useSelector } from 'react-redux'

const Friends = ({users, setShowFriends}) => {
    const { auth } = useSelector(state => state)
    return (
        <div className="follow">
            <div className="follow_box">
                <h5 className="text-center">Danh sách bạn bè</h5>
                <hr/>
                
                <div className="follow_content">
                    {
                        users.map(user => (
                            <UserCard key={user._id} user={user} setShowFollowers={setShowFriends} >
                                {
                                    auth.user._id !== user._id && <FriendBtn user={user} />
                                }
                            </UserCard>
                        ))
                    }
                </div>
                

                <div className="close" onClick={() => setShowFriends(false)}>
                    &times;
                </div>
                
            </div>
        </div>
    )
}

export default Friends
