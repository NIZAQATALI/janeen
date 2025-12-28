import express  from "express";
import { verifyAdmin ,verifyJWT} from "../utils/verifyToken.js";
import { createNewUser, deleteUser, getAllUsers, 
         getSingleUser, updateUser,loginUser ,createChild,getAllChildren,getChildById, childLogin,
         getAppAnalytics,
         sendInactiveUserEmailController} from "../Controllers/userController.js";
         import { upload } from '../MiddleWares/multer.middleware.js';
       
const router = express.Router()              
router.post('/adult/loginUser',loginUser)
router.post('/child/loginChild',childLogin)
router.post('/adult/createUser',upload.single('photo'), createNewUser)
router.put('/adult/updateUser',upload.single('photo'),verifyJWT,updateUser)
router.delete('/adult/deleteUser', deleteUser)
router.get('/adult/getUser', verifyJWT,getSingleUser)
router.get('/adult/getAllChild', verifyJWT,getAllChildren)
router.get('/getchildbyid/:id', verifyJWT, getChildById)
router.post('/child/createChild', createChild)
router.get("/analytics", verifyJWT,getAppAnalytics);
router.post("/send-inactive-email", sendInactiveUserEmailController);

router.get('/', getAllUsers)
export default router
