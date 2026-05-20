const Posts = require('../models/post.model')
const Comments = require('../models/comment.model')
const Users = require('../models/user.model')
const PostReports = require('../models/postReport.model')
const APIFeatures = require('../utils/apiFeatures')
const { getJSON, setJSON, delByPattern } = require('../utils/redisClient')
const { incrementLearnerScore } = require('../utils/leaderboard')
const { getAIAssistantUser, generateLearningComment } = require('../utils/aiLearningAssistant')

const populatePost = (query) => query
    .populate("user likes", "avatar username fullname followers")
    .populate({
        path: "comments",
        populate: {
            path: "user likes",
            select: "-password"
        }
    })

const CATEGORY_ALIASES = {
    "Tất cả": [],
    "Thảo luận": ["Thảo luận", "Tháº£o luáº­n"],
    "Hỏi đáp": ["Hỏi đáp", "Há»i Ä‘Ã¡p"],
    "Tài liệu": ["Tài liệu", "TÃ i liá»‡u"],
}

const normalizeCategory = (category) => {
    if (!category) return "Thảo luận"
    if (CATEGORY_ALIASES[category]) return category
    const match = Object.entries(CATEGORY_ALIASES).find(([, aliases]) => aliases.includes(category))
    return match ? match[0] : category
}

const applyCategoryFilter = (query, category) => {
    const normalized = normalizeCategory(category)
    if (!category || normalized === "Tất cả") return
    query.category = { $in: CATEGORY_ALIASES[normalized] || [normalized] }
}

const postCtrl = {
    createPost: async (req, res) => {
        try {
            const { content, images, category } = req.body

            if(!content.trim() && (!Array.isArray(images) || images.length === 0))
            return res.status(400).json({msg: "Vui lòng nhập nội dung bài viết hoặc đính kèm ảnh/file."})

            const isPremium = Boolean(req.user.aiEnabled)
            const newPost = new Posts({
                content,
                images,
                category: normalizeCategory(category),
                user: req.user._id,
                premium: isPremium,
                tags: isPremium ? ['premium'] : []
            })
            await newPost.save()

            let aiComment = null
            if(isPremium && content && content.trim()){
                try {
                    const ai = await generateLearningComment({
                        content,
                        focus: req.user.aiLearningFocus
                    })

                    if(ai && ai.text){
                        const aiUser = await getAIAssistantUser()
                        aiComment = await Comments.create({
                            user: aiUser._id,
                            content: ai.text,
                            postId: newPost._id,
                            postUserId: req.user._id,
                            isAI: true,
                            aiMeta: {
                                model: ai.model,
                                provider: 'openai'
                            }
                        })
                        await Posts.findByIdAndUpdate(newPost._id, {
                            $addToSet: {comments: aiComment._id}
                        })
                        aiComment = {
                            ...aiComment._doc,
                            user: {
                                _id: aiUser._id,
                                avatar: aiUser.avatar,
                                username: aiUser.username,
                                fullname: aiUser.fullname
                            }
                        }
                    }
                } catch (aiErr) {
                    console.warn('AI learning comment skipped:', aiErr.message)
                }
            }
            await delByPattern(`feed:${req.user._id}:*`)
            await delByPattern(`discover:*`)
            await incrementLearnerScore(req.user._id, 5)

            res.json({
                msg: 'Created Post!',
                newPost: {
                    ...newPost._doc,
                    comments: aiComment ? [aiComment] : [],
                    user: req.user
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPosts: async (req, res) => {
        try {
            const category = req.query.category;
            const cacheKey = `feed:all:v2:${req.query.page || 1}:${req.query.limit || 9}:${category || 'All'}`
            const cached = await getJSON(cacheKey)
            if(cached) return res.json(cached)

            const queryObj = {}
            applyCategoryFilter(queryObj, category)

            const features =  new APIFeatures(Posts.find(queryObj), req.query).paginating()

            const posts = await populatePost(features.query.sort('-createdAt'))

            const payload = {
                msg: 'Success!',
                result: posts.length,
                posts
            }
            await setJSON(cacheKey, payload, 30)
            res.json(payload)

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updatePost: async (req, res) => {
        try {
            const { content, images } = req.body

            const post = await populatePost(Posts.findOneAndUpdate({_id: req.params.id, user: req.user._id}, {
                content, images
            }, { new: true }))

            if(!post) return res.status(404).json({msg: 'This post does not exist or is not yours.'})
            await delByPattern(`feed:*`)
            await delByPattern(`discover:*`)

            res.json({
                msg: "Updated Post!",
                newPost: post
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    likePost: async (req, res) => {
        try {
            const like = await Posts.findOneAndUpdate({_id: req.params.id}, {
                $addToSet: {likes: req.user._id}
            }, {new: true})

            if(!like) return res.status(400).json({msg: 'This post does not exist.'})

            await delByPattern(`feed:*`)
            await incrementLearnerScore(req.user._id, 1)
            res.json({msg: 'Liked Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unLikePost: async (req, res) => {
        try {

            const like = await Posts.findOneAndUpdate({_id: req.params.id}, {
                $pull: {likes: req.user._id}
            }, {new: true})

            if(!like) return res.status(400).json({msg: 'This post does not exist.'})

            await delByPattern(`feed:*`)
            res.json({msg: 'UnLiked Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    reportPost: async (req, res) => {
        try {
            const { reason = "other", detail = "" } = req.body
            const post = await Posts.findById(req.params.id).select("user content").lean()
            if (!post) return res.status(404).json({ msg: "Bài viết không tồn tại." })

            if (post.user.toString() === req.user._id.toString()) {
                return res.status(400).json({ msg: "Bạn không thể báo cáo bài viết của chính mình." })
            }

            const report = await PostReports.findOneAndUpdate(
                { post: post._id, reporter: req.user._id },
                {
                    post: post._id,
                    reporter: req.user._id,
                    owner: post.user,
                    reason,
                    detail,
                    status: "pending",
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            )

            return res.json({
                msg: "Đã gửi báo cáo bài viết. Admin sẽ xem xét nội dung này.",
                report,
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getUserPosts: async (req, res) => {
        try {
            const features = new APIFeatures(Posts.find({user: req.params.id}), req.query)
            .paginating()
            const posts = await populatePost(features.query.sort("-createdAt"))

            res.json({
                posts,
                result: posts.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPost: async (req, res) => {
        try {
            const post = await populatePost(Posts.findById(req.params.id))

            if(!post) return res.status(400).json({msg: 'This post does not exist.'})

            res.json({
                post
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPostsDicover: async (req, res) => {
        try {
            const category = req.query.category;
            const newArr = [...req.user.following, req.user._id]

            const num  = Math.min(Number(req.query.num) || 9, 30)
            const cacheKey = `discover:v2:${req.user._id}:${num}:${category || 'All'}`
            const cached = await getJSON(cacheKey)
            if(cached) return res.json(cached)

            const matchStage = { user : { $nin: newArr } }
            applyCategoryFilter(matchStage, category)

            const posts = await Posts.aggregate([
                { $match: matchStage },
                { $sample: { size: num } },
            ])
            await Posts.populate(posts, [
                { path: "user likes", select: "avatar username fullname followers" },
                {
                    path: "comments",
                    populate: {
                        path: "user likes",
                        select: "-password"
                    }
                }
            ])

            const payload = {
                msg: 'Success!',
                result: posts.length,
                posts
            }
            await setJSON(cacheKey, payload, 60)
            return res.json(payload)

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deletePost: async (req, res) => {
        try {
            const post = await Posts.findOneAndDelete({_id: req.params.id, user: req.user._id})
            if(!post) return res.status(404).json({msg: 'This post does not exist or is not yours.'})
            await Comments.deleteMany({_id: {$in: post.comments }})
            await delByPattern(`feed:*`)
            await delByPattern(`discover:*`)

            res.json({
                msg: 'Deleted Post!',
                newPost: {
                    ...post,
                    user: req.user
                }
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    savePost: async (req, res) => {
        try {
            const save = await Users.findOneAndUpdate({_id: req.user._id}, {
                $addToSet: {saved: req.params.id}
            }, {new: true})

            if(!save) return res.status(400).json({msg: 'This user does not exist.'})

            res.json({msg: 'Saved Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unSavePost: async (req, res) => {
        try {
            const save = await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {saved: req.params.id}
            }, {new: true})

            if(!save) return res.status(400).json({msg: 'This user does not exist.'})

            res.json({msg: 'unSaved Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getSavePosts: async (req, res) => {
        try {
            const features = new APIFeatures(Posts.find({
                _id: {$in: req.user.saved}
            }), req.query).paginating()

            const savePosts = await populatePost(features.query.sort("-createdAt"))

            res.json({
                savePosts,
                result: savePosts.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}

module.exports = postCtrl
