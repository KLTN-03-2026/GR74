import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getDataAPI } from '../../utils/fetchData'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { getErrorMessage } from '../../utils/errorMessage'
import UserCard from '../UserCard'
import LoadIcon from '../../images/loading.gif'

const Search = () => {
    const [search, setSearch] = useState('')
    const [users, setUsers] = useState([])
    const [posts, setPosts] = useState([])

    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()
    const [load, setLoad] = useState(false)


    const handleSearch = async (e) => {
        e.preventDefault()
        if(!search) return;

        try {
            setLoad(true)
            const res = await getDataAPI(`search?username=${search}`, auth.token)
            setUsers(res.data.users || [])
            setPosts(res.data.posts || [])
            setLoad(false)
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}
            })
            setLoad(false)
        }
    }

    const handleClose = () => {
        setSearch('')
        setUsers([])
        setPosts([])
    }

    const hasResults = users.length > 0 || posts.length > 0;

    return (
        <form className="search_form" onSubmit={handleSearch}>
            <input type="text" name="search" value={search} id="search" title="Enter to Search"
            placeholder="Search..."
            onChange={e => setSearch(e.target.value)} />

            <div className="search_icon" aria-hidden="true">
                <span className="material-icons">search</span>
            </div>

            <div className="close_search" onClick={handleClose}
            style={{opacity: hasResults ? 1 : 0}} >
                &times;
            </div>

            <button type="submit" style={{display: 'none'}}>Search</button>

            { load && <img className="loading" src={LoadIcon} alt="loading"  /> }

            <div className="users" style={{ display: hasResults ? 'block' : 'none', padding: '10px', maxHeight: '450px', overflowY: 'auto' }}>
                {
                    users.length > 0 && (
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', color: '#004ac6', marginBottom: '8px', borderBottom: '1px solid #c3c6d7', paddingBottom: '4px' }}>
                                Thành viên ({users.length})
                            </div>
                            {users.map(user => (
                                <UserCard 
                                key={user._id} 
                                user={user} 
                                border="border"
                                handleClose={handleClose} 
                                />
                            ))}
                        </div>
                    )
                }

                {
                    posts.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', color: '#004ac6', marginBottom: '8px', borderBottom: '1px solid #c3c6d7', paddingBottom: '4px' }}>
                                Bài viết ({posts.length})
                            </div>
                            {posts.map(post => (
                                <Link 
                                    key={post._id} 
                                    to={`/post/${post._id}`} 
                                    onClick={handleClose}
                                    style={{ display: 'flex', gap: '8px', textDecoration: 'none', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '8px', background: '#fff', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                >
                                    <img 
                                        src={post.user?.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5Fy2CcEklNju2NfUSaKt7cRAwVJRhwZkS2w&s'} 
                                        alt="avatar" 
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0b1c30' }}>
                                            {post.user?.fullname}
                                        </div>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {post.content}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                }
            </div>
        </form>
    )
}

export default Search
