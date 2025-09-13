import express  from "express";
import { verifyAdmin ,verifyJWT} from "../utils/verifyToken.js";
import { createNewUser, deleteUser, getAllUsers, 
         getSingleUser, updateUser,loginUser ,createChild,getAllChildren,getChildById, childLogin} from "../Controllers/userController.js";
         import { upload } from '../MiddleWares/multer.middleware.js';
const router = express.Router()              
router.post('/loginUser',loginUser )
router.post('/loginchild',childLogin)
router.post('/createUser',upload.single('photo'), createNewUser)
router.put('/updateUser',upload.single('photo'),verifyJWT,updateUser)
router.delete('/deleteUser', deleteUser)
router.get('/getUser', verifyJWT,getSingleUser)
router.get('/getAllChild', verifyJWT,getAllChildren)
router.get('/getchildbyid/:id', verifyJWT, getChildById)
router.post('/createChild', createChild)
router.get('/', getAllUsers)

export default router
