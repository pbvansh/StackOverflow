
const Router = require('@koa/router');
const { addAns, upVote, downVote } = require('../controllers/ansController');
const { canAns, inOrg, checkVote } = require('../middleware/ansMidd');
const { protect } = require('../middleware/protect');
const { isValidAns } = require('../validators/ansVaild');
const { trimData } = require('../validators/qnsValid');

const router = new Router({
    prefix: '/ans'
})

router.post('/:id', protect, canAns, trimData, isValidAns, addAns)
router.post('/')
router.post('/upvote/:id', protect, inOrg, checkVote, upVote);
router.post('/downVote/:id', protect, inOrg, checkVote, downVote);

module.exports = router
