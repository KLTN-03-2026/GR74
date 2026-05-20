const router = require('express').Router()

router.use('/', require('./auth.routes'))
router.use('/', require('./user.routes'))
router.use('/', require('./post.routes'))
router.use('/', require('./comment.routes'))
router.use('/', require('./notify.routes'))
router.use('/', require('./message.routes'))
router.use('/', require('./learning.routes'))
router.use('/', require('./admin.routes'))
router.use('/', require('./premium.routes'))
router.use('/', require('./aiChat.routes'))

module.exports = router
