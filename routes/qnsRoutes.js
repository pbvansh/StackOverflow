
const Router = require('@koa/router');
const { getQns, askQns, updateQns, deleteQns, upVote, downVote, getSingleQns } = require('../controllers/qnsController');
const { havePermision, canChange } = require('../middleware/qnsMidd');
const { protect, isAdminOrOwner } = require('../middleware/protect');
const { isTitle, isdesc, isTags, setOrg, filter } = require('../validators/qnsValid');
const { inOrg, checkVote } = require('../middleware/ansMidd');

const router = new Router({
    prefix: '/qns'
})

router.get('/', protect, filter, getQns);
router.get('/:id', protect, getSingleQns);
router.post('/', protect, setOrg, isTitle, isdesc, isTags, askQns);
router.post('/upvote/:id', protect, inOrg, checkVote, upVote);
router.post('/downVote/:id', protect, inOrg, checkVote, downVote);
router.patch('/:id', protect, havePermision, canChange, isTitle, isdesc, isTags, updateQns);
router.delete('/:id', protect, havePermision, canChange, deleteQns);

module.exports = router