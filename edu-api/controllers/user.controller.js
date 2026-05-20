const Users = require('../models/user.model')
const Posts = require('../models/post.model')

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const userCtrl = {
    searchUser: async (req, res) => {
        try {
            const queryVal = (req.query.username || "").trim()
            if(!queryVal) return res.json({ users: [], posts: [] })

            const searchRegex = escapeRegex(queryVal)

            const users = await Users.find({
                $or: [
                    { username: { $regex: searchRegex, $options: "i" } },
                    { fullname: { $regex: searchRegex, $options: "i" } }
                ]
            })
            .limit(10).select("fullname username avatar").lean()

            const posts = await Posts.find({
                content: { $regex: searchRegex, $options: "i" }
            })
            .limit(10)
            .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })
            .lean()
            
            res.json({ users, posts })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.params.id).select('-password')
            .populate("followers following", "-password")
            if(!user) return res.status(400).json({msg: "User does not exist."})
            
            res.json({user})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUser: async (req, res) => {
        try {
            const { avatar, fullname, mobile, address, story, website, gender } = req.body
            if(!fullname) return res.status(400).json({msg: "Please add your full name."})

            const user = await Users.findOneAndUpdate({_id: req.user._id}, {
                avatar, fullname, mobile, address, story, website, gender
            }, { new: true }).select("-password")

            res.json({msg: "Update Success!", user})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    follow: async (req, res) => {
        try {
            if(req.params.id === req.user._id.toString()) {
                return res.status(400).json({msg: "You cannot follow yourself."})
            }

            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, { 
                $addToSet: {followers: req.user._id}
            }, {new: true}).populate("followers following", "-password")
            if(!newUser) return res.status(404).json({msg: "User does not exist."})

            await Users.findOneAndUpdate({_id: req.user._id}, {
                $addToSet: {following: req.params.id}
            }, {new: true})

            res.json({newUser})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unfollow: async (req, res) => {
        try {

            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, { 
                $pull: {followers: req.user._id}
            }, {new: true}).populate("followers following", "-password")

            await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {following: req.params.id}
            }, {new: true})

            res.json({newUser})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    addFriend: async (req, res) => {
        try {
            if(req.params.id === req.user._id.toString()) return res.status(400).json({msg: "You cannot add yourself."})
            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, { 
                $addToSet: {friendRequests: req.user._id}
            }, {new: true}).populate("followers following friends friendRequests sentRequests", "-password")
            
            await Users.findOneAndUpdate({_id: req.user._id}, {
                $addToSet: {sentRequests: req.params.id}
            }, {new: true})

            res.json({newUser, msg: "Friend request sent"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    cancelFriendRequest: async (req, res) => {
        try {
            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, { 
                $pull: {friendRequests: req.user._id}
            }, {new: true}).populate("followers following friends friendRequests sentRequests", "-password")
            
            await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {sentRequests: req.params.id}
            }, {new: true})

            res.json({newUser, msg: "Friend request cancelled"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    acceptFriend: async (req, res) => {
        try {
            // Target user sent request to current user -> Target is in req.user.friendRequests
            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, {
                $pull: {sentRequests: req.user._id},
                $addToSet: {friends: req.user._id}
            }, {new: true}).populate("followers following friends friendRequests sentRequests", "-password")

            await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {friendRequests: req.params.id},
                $addToSet: {friends: req.params.id}
            }, {new: true})

            res.json({newUser, msg: "Friend request accepted"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    rejectFriend: async (req, res) => {
        try {
            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, {
                $pull: {sentRequests: req.user._id}
            }, {new: true}).populate("followers following friends friendRequests sentRequests", "-password")

            await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {friendRequests: req.params.id}
            }, {new: true})

            res.json({newUser, msg: "Friend request rejected"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unfriend: async (req, res) => {
        try {
            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, {
                $pull: {friends: req.user._id}
            }, {new: true}).populate("followers following friends friendRequests sentRequests", "-password")

            await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {friends: req.params.id}
            }, {new: true})

            res.json({newUser, msg: "Unfriended"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    suggestionsUser: async (req, res) => {
        try {
            const newArr = [...req.user.following, req.user._id]

            const num  = Math.min(Number(req.query.num) || 10, 30)

            const users = await Users.aggregate([
                { $match: { _id: { $nin: newArr } } },
                { $sample: { size: num } },
                { $project: { password: 0 } },
                { $lookup: { from: 'users', localField: 'followers', foreignField: '_id', as: 'followers' } },
                { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'following' } },
                { $project: { 'followers.password': 0, 'following.password': 0 } },
            ])

            return res.json({
                users,
                result: users.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    blockUser: async (req, res) => {
        try {
            if(req.params.id === req.user._id.toString()) {
                return res.status(400).json({msg: "You cannot block yourself."})
            }

            // Add to blocked list and remove friendship/follow relations on current user
            const newUser = await Users.findOneAndUpdate({_id: req.user._id}, {
                $addToSet: {blockedUsers: req.params.id},
                $pull: {
                    friends: req.params.id,
                    following: req.params.id,
                    followers: req.params.id,
                    friendRequests: req.params.id,
                    sentRequests: req.params.id
                }
            }, {new: true}).populate("followers following friends friendRequests sentRequests blockedUsers", "-password")

            // Remove current user from other user's relations
            await Users.findOneAndUpdate({_id: req.params.id}, {
                $pull: {
                    friends: req.user._id,
                    following: req.user._id,
                    followers: req.user._id,
                    friendRequests: req.user._id,
                    sentRequests: req.user._id
                }
            })

            res.json({newUser, msg: "Blocked user successfully."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unblockUser: async (req, res) => {
        try {
            const newUser = await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {blockedUsers: req.params.id}
            }, {new: true}).populate("followers following friends friendRequests sentRequests blockedUsers", "-password")

            res.json({newUser, msg: "Unblocked user successfully."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}


module.exports = userCtrl
