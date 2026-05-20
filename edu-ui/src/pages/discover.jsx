import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment'
import { BookOpenCheck, BookmarkPlus, Compass, Eye, Flame, GraduationCap, Heart, HelpCircle, LayoutDashboard, MessageCircle, MoreHorizontal, Plus, RefreshCw, Search, Settings, Share2, ShieldCheck, Sparkles, Star, UserRound, UsersRound } from 'lucide-react'
import { getDiscoverPosts, DISCOVER_TYPES } from '../redux/actions/discoverAction'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import LoadIcon from '../images/loading.gif'
import LoadMoreBtn from '../components/LoadMoreBtn'
import { getDataAPI} from '../utils/fetchData'
import Avatar from '../components/Avatar'

const getMediaUrl = (post) => {
    const media = post.images?.[0]
    if(!media) return ''
    return typeof media === 'string' ? media : media.url || ''
}

const DiscoverCard = ({ post, index }) => {
    const mediaUrl = getMediaUrl(post)
    const isVideo = /video/i.test(mediaUrl)
    const topic = post.premium ? 'Premium' : index % 3 === 0 ? 'Khoa hoc' : index % 3 === 1 ? 'Thao luan' : 'Hoc tap'

    return (
        <article className={`discover_card ${!mediaUrl ? 'text_only' : ''}`}>
            <Link to={`/post/${post._id}`} className="discover_card_link">
                {
                    mediaUrl &&
                    <div className={`discover_card_media media_${(index % 3) + 1}`}>
                        {
                            isVideo
                            ? <video src={mediaUrl} />
                            : <img src={mediaUrl} alt={post.content || 'discover post'} />
                        }
                        <span className={post.premium ? 'premium_badge' : ''}>
                            {post.premium && <Star size={14} />}
                            {topic}
                        </span>
                    </div>
                }

                <div className="discover_card_body">
                    <div className="discover_card_top">
                        <span>{topic}</span>
                        <MoreHorizontal size={19} />
                    </div>

                    <h2>{post.content ? post.content.slice(0, 72) : 'Learning update from Edu Social'}</h2>
                    <p>{post.content || 'Bai viet hoc tap dang duoc cong dong chia se va thao luan.'}</p>

                    {
                        !mediaUrl &&
                        <div className="discover_quote">
                            "Dung Discover de tim bai hoc, cau hoi va loi giai ngoai vong ket noi cua ban."
                        </div>
                    }

                    <div className="discover_author">
                        <Avatar src={post.user?.avatar} size="medium-avatar" />
                        <div>
                            <strong>{post.user?.username || 'student'}</strong>
                            <span>{moment(post.createdAt).fromNow()}</span>
                        </div>
                    </div>
                </div>
            </Link>

            <div className="discover_card_actions">
                <span><Heart size={17} /> {post.likes?.length || 0}</span>
                <span><MessageCircle size={17} /> {post.comments?.length || 0}</span>
                <span><Eye size={17} /> {post.images?.length || 0}</span>
                <button type="button"><BookmarkPlus size={17} /> Luu</button>
                <button type="button"><Share2 size={17} /></button>
            </div>
        </article>
    )
}

const Discover = () => {
    const { auth, discover } = useSelector(state => state)
    const dispatch = useDispatch()

    const [load, setLoad] = useState(false)

    useEffect(() => {
        if(!discover.firstLoad){
            dispatch(getDiscoverPosts(auth.token))
        }
    },[dispatch, auth.token, discover.firstLoad])

    const handleLoadMore = async () => {
        setLoad(true)
        const res = await getDataAPI(`post_discover?num=${discover.page * 9}`, auth.token)
        dispatch({type: DISCOVER_TYPES.UPDATE_POST, payload: res.data})
        setLoad(false)
    }

    return (
        <main className="discover_page">
            <section className="discover_hero">
                <div>
                    <p><Compass size={16} /> Edu Social Discover</p>
                    <h1>Kham pha kien thuc moi</h1>
                    <span>Tim bai viet hoc tap, bai giai, thao luan chuyen sau va nguoi dung moi ngoai vong ket noi cua ban.</span>
                </div>
                <button type="button" onClick={() => dispatch(getDiscoverPosts(auth.token))}>
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </section>

            <section className="discover_toolbar">
                <div className="discover_search">
                    <Search size={19} />
                    <input placeholder="Tim kiem bai viet, khoa hoc, tac gia..." type="text" />
                </div>

                <div className="discover_filters">
                    <button className="active" type="button"><Flame size={16} /> Xu huong</button>
                    <button type="button"><Sparkles size={16} /> Moi nhat</button>
                    <button type="button"><Star size={16} /> Premium</button>
                    <button type="button"><UsersRound size={16} /> Moi nguoi</button>
                </div>
            </section>

            <section className="discover_stats">
                <article>
                    <Sparkles size={18} />
                    <span>Posts found</span>
                    <strong>{discover.result || discover.posts.length}</strong>
                </article>
                <article>
                    <UsersRound size={18} />
                    <span>Your following</span>
                    <strong>{auth.user?.following?.length || 0}</strong>
                </article>
                <article>
                    <Compass size={18} />
                    <span>Page depth</span>
                    <strong>{discover.page}</strong>
                </article>
                <article>
                    <GraduationCap size={18} />
                    <span>Learning mode</span>
                    <strong>AI</strong>
                </article>
            </section>

            <div className="discover_layout">
                <aside className="discover_side">
                    <div className="discover_user_card">
                        <Avatar src={auth.user?.avatar} size="big-avatar" />
                        <div>
                            <strong>{auth.user?.username || 'student'}</strong>
                            <span>{auth.user?.fullname || 'Edu Social learner'}</span>
                        </div>
                    </div>

                    <nav className="discover_nav_card">
                        <Link to="/"><LayoutDashboard size={19} /> Dashboard</Link>
                        <Link to={`/profile/${auth.user?._id}`}><UserRound size={19} /> My Profile</Link>
                        <Link to="/discover" className="active"><Compass size={19} /> Discover</Link>
                        <Link to="/message"><UsersRound size={19} /> Groups</Link>
                        <Link to="/change_password"><Settings size={19} /> Settings</Link>
                    </nav>

                    <button
                        className="discover_start_btn"
                        type="button"
                        onClick={() => dispatch({ type: GLOBALTYPES.STATUS, payload: true })}
                    >
                        <Plus size={18} />
                        Start New Post
                    </button>

                    <div className="discover_tip">
                        <BookOpenCheck size={22} />
                        <h3>Learning tip</h3>
                        <p>Luu cac bai viet hay de dua vao phan bao ve: feed, tuong tac, AI Premium va moderation.</p>
                    </div>

                    <div className="discover_topics">
                        <h3>Chu de noi bat</h3>
                        <span>#AI</span>
                        <span>#LapTrinh</span>
                        <span>#ToanUngDung</span>
                        <span>#KhoaLuan</span>
                    </div>

                    <div className="discover_help_links">
                        <Link to="/landing"><HelpCircle size={16} /> Help Center</Link>
                        <Link to="/landing"><ShieldCheck size={16} /> Privacy</Link>
                    </div>
                </aside>

                <section className="discover_content">
                    <div className="discover_section_head">
                        <div>
                            <span>Community knowledge</span>
                            <h2>Bai viet dang kham pha</h2>
                        </div>
                        <p>Noi dung duoc lay tu API `post_discover`, khong phai mockup tinh.</p>
                    </div>
                    {
                        discover.loading 
                        ? <img src={LoadIcon} alt="loading" className="d-block mx-auto my-4" />
                        : discover.result === 0
                            ? <div className="discover_empty">Chua co bai viet kham pha.</div>
                            : <div className="discover_masonry">
                                {
                                    discover.posts.map((post, index) => (
                                        <DiscoverCard key={post._id} post={post} index={index} />
                                    ))
                                }
                            </div>
                    }
                </section>
            </div>

            {
                load && <img src={LoadIcon} alt="loading" className="d-block mx-auto" />
            }

            {
                !discover.loading &&
                <LoadMoreBtn result={discover.result} page={discover.page}
                load={load} handleLoadMore={handleLoadMore} />
            }
            
        </main>
    )
}

export default Discover
