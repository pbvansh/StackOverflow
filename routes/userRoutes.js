const Router = require('@koa/router')
const { signupUser, loginUser, changePassword, forgotePasswordLink, inviteTeamMember, forgotePassword, getTeam, updatedUser, deleteUser } = require('../controllers/userController')
const { protect, isAdminOrOwner, isOwner, havePermision } = require('../middleware/protect')
const { trimData } = require('../validators/qnsValid')
const { isAllFields, isEmail, checkPassword, setRoleOrEmail, isRole, isPassword, isValidData, isLogo, isUniqMail, isUniqUserName, isMailExsist, isValidLink } = require('../validators/userValid')

const router = new Router({
    prefix: '/user'
})

router.get('/', isOwner, getTeam)
router.post('/signup', setRoleOrEmail, trimData, isAllFields, isEmail, isPassword, isLogo, checkPassword, isUniqMail, isUniqUserName, signupUser)
router.post('/login', trimData, isEmail, isPassword, checkPassword, loginUser)
router.patch('/changepassword', trimData, protect, isPassword, checkPassword, changePassword)
router.post('/forgotepassword', trimData, isEmail, isMailExsist, forgotePasswordLink)
router.patch('/forgotepassword/:token', trimData, isPassword, checkPassword, isValidLink, forgotePassword)
router.post('/invite', isAdminOrOwner, trimData, isEmail, isRole, inviteTeamMember)
router.put('/:id', havePermision, trimData, isValidData, isLogo, isUniqUserName, updatedUser)
router.delete('/:id', havePermision, deleteUser)

module.exports = router;