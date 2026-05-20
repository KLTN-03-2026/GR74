const router = require('express').Router()
const auth = require("../middleware/auth")
const userCtrl = require("../controllers/user.controller")


router.get('/search', auth, userCtrl.searchUser)

router.get('/user/:id', auth, userCtrl.getUser)

router.patch('/user', auth, userCtrl.updateUser)

router.patch('/user/:id/follow', auth, userCtrl.follow)
router.patch('/user/:id/unfollow', auth, userCtrl.unfollow)

// Friend System
router.patch('/user/:id/add_friend', auth, userCtrl.addFriend)
router.patch('/user/:id/cancel_friend', auth, userCtrl.cancelFriendRequest)
router.patch('/user/:id/accept_friend', auth, userCtrl.acceptFriend)
router.patch('/user/:id/reject_friend', auth, userCtrl.rejectFriend)
router.patch('/user/:id/unfriend', auth, userCtrl.unfriend)

// Block / Unblock System
router.patch('/user/:id/block', auth, userCtrl.blockUser)
router.patch('/user/:id/unblock', auth, userCtrl.unblockUser)

router.get('/suggestionsUser', auth, userCtrl.suggestionsUser)



module.exports = router