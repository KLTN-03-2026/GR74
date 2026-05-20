import React from 'react'
import { motion } from 'framer-motion'
import CardHeader from './home/post_card/CardHeader'
import CardBody from './home/post_card/CardBody'
import CardFooter from './home/post_card/CardFooter'

import Comments from './home/Comments'
import InputComment from './home/InputComment'

const PostCard = ({post, theme}) => {
    return (
        <motion.article
            className="card post-card my-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            whileHover={{ y: -3 }}
        >
            <CardHeader post={post} />
            <CardBody post={post} theme={theme} />
            <CardFooter post={post} />

            <Comments post={post} />
            <InputComment post={post} />
        </motion.article>
    )
}

export default PostCard
