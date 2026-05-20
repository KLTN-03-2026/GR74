import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PostCard from '../PostCard'

import LoadIcon from '../../images/loading.gif'
import LoadMoreBtn from '../LoadMoreBtn'
import { getDataAPI } from '../../utils/fetchData'
import { POST_TYPES } from '../../redux/actions/postAction'


const Posts = ({ category }) => {
    const { homePosts, auth, theme } = useSelector(state => state)
    const dispatch = useDispatch()

    const [load, setLoad] = useState(false)

    const handleLoadMore = async () => {
        setLoad(true)
        const categoryQuery = category && category !== 'Tất cả'
            ? `&category=${encodeURIComponent(category)}`
            : ''
        const [feedRes, discoverRes] = await Promise.all([
            getDataAPI(`posts?limit=${homePosts.page * 9}${categoryQuery}`, auth.token),
            getDataAPI(`post_discover?num=${homePosts.page * 9}${categoryQuery}`, auth.token).catch(() => ({ data: { posts: [] } }))
        ])
        const posts = [
            ...(feedRes.data.posts || []),
            ...(discoverRes.data.posts || [])
        ].filter((post, index, arr) => (
            arr.findIndex((item) => item._id === post._id) === index
        ))

        dispatch({
            type: POST_TYPES.GET_POSTS, 
            payload: {...feedRes.data, posts, result: posts.length, page: homePosts.page + 1}
        })

        setLoad(false)
    }

    return (
        <div className="posts">
            {
                homePosts.posts.map(post => (
                    <PostCard key={post._id} post={post} theme={theme} />
                ))
            }

            {
                load && <img src={LoadIcon} alt="loading" className="d-block mx-auto" />
            }

            
            <LoadMoreBtn result={homePosts.result} page={homePosts.page}
            load={load} handleLoadMore={handleLoadMore} />
        </div>
    )
}

export default Posts
