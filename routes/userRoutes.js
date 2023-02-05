const Router = require('@koa/router')
const { signupUser, loginUser, changePassword, forgotePasswordLink, inviteTeamMember, forgotePassword, getTeam, updatedUser, deleteUser } = require('../controllers/userController')
const { protect, isAdminOrOwner, isValidEmail, isOwner, havePermision } = require('../middleware/protect')
const { isAllFields, isEmail, checkPassword, setRoleOrEmail, isRole, isPassword, isValidData } = require('../validators/userValid')

const router = new Router({
    prefix: '/user'
})

router.get('/', isOwner, getTeam)
router.post('/signup', setRoleOrEmail, isAllFields, isEmail, isPassword, checkPassword, signupUser)
router.post('/login', isEmail, isPassword, checkPassword, loginUser)
router.patch('/changepwd', protect, isPassword, checkPassword, changePassword)
router.post('/forgotepwd', isEmail, forgotePasswordLink)
router.patch('/forgotepwd/:token', isPassword, checkPassword, forgotePassword)
router.post('/invite', isAdminOrOwner, isEmail, isRole, inviteTeamMember)
router.put('/:id',havePermision,isValidData, updatedUser)
router.delete('/:id', havePermision, deleteUser)

module.exports = router;