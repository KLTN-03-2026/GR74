import React, { useEffect, useState } from 'react'

import Info from '../../components/profile/Info'
import Posts from '../../components/profile/Posts'
import Saved from '../../components/profile/Saved'

import { useSelector, useDispatch } from 'react-redux'
import LoadIcon from '../../images/loading.gif'
import { getProfileUsers } from '../../redux/actions/profileAction'
import { useParams } from 'react-router-dom'


const Profile = () => {
    const { profile, auth } = useSelector(state => state)
    const dispatch = useDispatch()

    const { id } = useParams()
    const [saveTab, setSaveTab] = useState(false)

    useEffect(() => {
        if(profile.ids.every(item => item !== id)){
            dispatch(getProfileUsers({id, auth}))
        }
    },[id, auth, dispatch, profile.ids])

    return (
        <div className="profile">
            
            <Info auth={auth} profile={profile} dispatch={dispatch} id={id} />

            {
                auth.user._id === id &&
                <div className="profile_tab">
                    <button className={saveTab ? '' : 'active'} onClick={() => setSaveTab(false)}>Bài đăng</button>
                    <button className={saveTab ? 'active' : ''} onClick={() => setSaveTab(true)}>Đã lưu</button>
                </div>
            }

            <section className="profile_content_panel">
                <div className="profile_section_head">
                    <div>
                        <span>Hồ sơ học tập</span>
                        <h3>{saveTab ? 'Bài viết đã lưu' : 'Bài viết của người dùng'}</h3>
                    </div>
                    <p>{saveTab ? 'Tài nguyên học tập bạn đã đánh dấu.' : 'Các chia sẻ học tập, bài tập và thành tựu gần đây.'}</p>
                </div>

                {
                    profile.loading 
                    ? <img className="d-block mx-auto" src={LoadIcon} alt="loading" />
                    : <>
                        {
                            saveTab
                            ? <Saved auth={auth} dispatch={dispatch} />
                            : <Posts auth={auth} profile={profile} dispatch={dispatch} id={id} />
                        }
                    </>
                }
            </section>
            
        </div>
    )
}

export default Profile
