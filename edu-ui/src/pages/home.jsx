import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookmarkCheck, Flame, Sparkles, Trophy, UsersRound } from 'lucide-react'

import Status from '../components/home/Status'
import Posts from '../components/home/Posts'
import RightSideBar from '../components/home/RightSideBar'
import { getPosts } from '../redux/actions/postAction'

import { useDispatch, useSelector } from 'react-redux'
import LoadIcon from '../images/loading.gif'


let scroll = 0;

const Home = () => {
    const { homePosts, auth, suggestions } = useSelector(state => state)
    const dispatch = useDispatch()
    const activityScore = homePosts.posts.length + suggestions.users.length

    const [currentTab, setCurrentTab] = useState('Tất cả')

    const handleTabChange = (tab) => {
        setCurrentTab(tab)
    }

    useEffect(() => {
        if(auth.token) {
            dispatch(getPosts(auth.token, currentTab))
        }
    }, [dispatch, auth.token, currentTab])

    useEffect(() => {
        const handleScroll = () => {
            if(window.location.pathname === '/'){
                scroll = window.pageYOffset
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })

        setTimeout(() => {
            window.scrollTo({top: scroll, behavior: 'smooth'})
        }, 100)

        return () => window.removeEventListener('scroll', handleScroll)
    },[])

    return (
        <div className="home_page">
            <div className="home_inner_grid">
                <section className="learning-center">
                    <section className="learning-hero">
                        <div>
                            <p className="learning-kicker">EduSocial Learning Network</p>
                            <h1>{auth.user?.fullname ? `Chào mừng trở lại, ${auth.user.fullname}` : 'Build your learning streak'}</h1>
                            <p className="learning-copy">
                                Your academic journey is progressing well. Here is a quick overview of your network and recent activities.
                            </p>
                        </div>
                        <motion.div
                            className="level-card"
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.45 }}
                        >
                            <Sparkles size={22} />
                            <span>Level Up Ready</span>
                            <strong>{activityScore}</strong>
                        </motion.div>
                    </section>

                    <section className="learning-bento" aria-label="Learning stats">
                        <motion.div className="bento-tile bento-wide" whileHover={{ y: -3 }}>
                            <Flame />
                            <span>Feed Signals</span>
                            <strong>{homePosts.result || homePosts.posts.length}</strong>
                        </motion.div>
                        <motion.div className="bento-tile" whileHover={{ y: -3 }}>
                            <UsersRound />
                            <span>Study Circle</span>
                            <strong>{auth.user?.following?.length || 0}</strong>
                        </motion.div>
                        <motion.div className="bento-tile" whileHover={{ y: -3 }}>
                            <BookmarkCheck />
                            <span>Saved Wins</span>
                            <strong>{auth.user?.saved?.length || 0}</strong>
                        </motion.div>
                        <motion.div className="bento-tile" whileHover={{ y: -3 }}>
                            <Trophy />
                            <span>Mentors</span>
                            <strong>{suggestions.users.length}</strong>
                        </motion.div>
                    </section>

                    <div className="learning-feed">
                        <Status />

                        <div className="feed-category-tabs" style={{
                            display: 'flex',
                            gap: '8px',
                            margin: '20px 0 12px 0',
                            borderBottom: '1px solid #e2e8f0',
                            paddingBottom: '8px'
                        }}>
                            {['Tất cả', 'Thảo luận', 'Hỏi đáp', 'Tài liệu'].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => handleTabChange(tab)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: currentTab === tab ? '#004ac6' : 'transparent',
                                        color: currentTab === tab ? '#fff' : '#64748b',
                                    }}
                                    onMouseEnter={e => {
                                        if (currentTab !== tab) {
                                            e.currentTarget.style.background = '#f1f5f9';
                                            e.currentTarget.style.color = '#0f172a';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (currentTab !== tab) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#64748b';
                                        }
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {
                            homePosts.loading
                            ? <img src={LoadIcon} alt="loading" className="d-block mx-auto" />
                            : (homePosts.result === 0 && homePosts.posts.length === 0)
                                ? <h2 className="text-center">No Post</h2>
                                : <Posts category={currentTab} />
                        }
                    </div>
                </section>

                <div className="learning-side">
                    <RightSideBar />
                </div>
            </div>
        </div>
    )
}

export default Home
