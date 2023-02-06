const Router = require('@koa/router')
const { signupUser, loginUser, changePassword, forgotePasswordLink, inviteTeamMember, forgotePassword, getTeam, updatedUser, deleteUser } = require('../controllers/userController')
const { protect, isAdminOrOwner, isValidEmail, isOwner, havePermision } = require('../middleware/protect')
const { isAllFields, isEmail, checkPassword, setRoleOrEmail, isRole, isPassword, isValidData, isLogo, isUniqMail, isUniqUserName, isMailExsist } = require('../validators/userValid')

const router = new Router({
    prefix: '/user'
})

router.get('/', isOwner, getTeam)
router.post('/signup', setRoleOrEmail, isAllFields, isEmail, isPassword, isLogo, checkPassword, isUniqMail, isUniqUserName, signupUser)
router.post('/login', isEmail, isPassword, checkPassword, loginUser)
router.patch('/changepassword', protect, isPassword, checkPassword, changePassword)
router.post('/forgotepassword', isEmail, isMailExsist, forgotePasswordLink)
router.patch('/forgotepassword/:token', isPassword, checkPassword, forgotePassword)
router.post('/invite', isAdminOrOwner, isEmail, isRole, inviteTeamMember)
router.put('/:id', havePermision, isValidData, isLogo, isUniqUserName, updatedUser)
router.delete('/:id', havePermision, deleteUser)

module.exports = router;