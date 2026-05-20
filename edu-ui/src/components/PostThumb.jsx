import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PostThumb = ({posts, result}) => {
    const { theme } = useSelector(state => state)

    if(result === 0) return <h2 className="text-center text-danger">Chưa có bài viết</h2>

    const getMediaUrl = (post) => {
        const media = post.images?.[0]
        if(!media) return ''
        return typeof media === 'string' ? media : media.url || ''
    }

    return (
        <div className="post_thumb">
            {
                posts.map(post => {
                    const mediaUrl = getMediaUrl(post)
                    return (
                        <Link key={post._id} to={`/post/${post._id}`}>
                            <div className="post_thumb_display">

                                {
                                    mediaUrl.match(/video/i)
                                    ?<video controls src={mediaUrl}
                                    style={{filter: theme ? 'invert(1)' : 'invert(0)'}} />

                                    :<img src={mediaUrl} alt={post.content || 'post'}
                                    style={{filter: theme ? 'invert(1)' : 'invert(0)'}} />
                                }

                                <div className="post_thumb_menu">
                                    <i className="far fa-heart">{post.likes?.length || 0}</i>
                                    <i className="far fa-comment">{post.comments?.length || 0}</i>
                                </div>
                            </div>
                        </Link>
                    )
                })
            }
        </div>
    )
}

export default PostThumb
