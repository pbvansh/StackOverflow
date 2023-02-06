const Router = require('@koa/router');
const { getAllTags } = require('../controllers/tagsController');
const { protect } = require('../middleware/protect');

const router = new Router({
    prefix : '/tags'
})

router.get('/',protect,getAllTags)

module.exports = router;