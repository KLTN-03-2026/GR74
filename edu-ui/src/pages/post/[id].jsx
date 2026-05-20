import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import LoadIcon from '../../images/loading.gif'
import PostCard from '../../components/PostCard'
import { getDataAPI } from '../../utils/fetchData'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { getErrorMessage } from '../../utils/errorMessage'
import { POST_TYPES } from '../../redux/actions/postAction'


const Post = () => {
    const { id } = useParams()
    const [post, setPost] = useState([])

    const { auth, detailPost } = useSelector(state => state)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const cached = detailPost.filter(p => p._id === id)
        if(cached.length > 0){
            // Deduplicate – only use the first match
            setPost([cached[0]])
            setLoading(false)
            setNotFound(false)
            return
        }

        const loadPost = async () => {
            if(!auth.token) return
            setLoading(true)
            setNotFound(false)
            try {
                const res = await getDataAPI(`post/${id}`, auth.token)
                dispatch({ type: POST_TYPES.GET_POST, payload: res.data.post })
                setPost([res.data.post])
            } catch (err) {
                setNotFound(true)
                dispatch({ type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)} })
            } finally {
                setLoading(false)
            }
        }

        loadPost()
    },[detailPost, dispatch, id, auth.token])

    return (
        <div className="posts post_detail_page">
            {
                loading &&
                <img src={LoadIcon} alt="loading" className="d-block mx-auto my-4" />
            }

            {
                !loading && notFound &&
                <section className="post_detail_empty">
                    <h2>Post not found</h2>
                    <p>This post may have been removed or is no longer available.</p>
                </section>
            }

            {
                !loading && post.map(item => (
                    <PostCard key={item._id} post={item} />
                ))
            }
        </div>
    )
}

export default Post
