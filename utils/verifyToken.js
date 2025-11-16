import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Child from '../models/Child.js'
//custom middlewares

import { ApiResponse } from '../utils/ApiResponse.js';
//1) TO VERIFY TOKEN
export const verifyToken = (req, res, next)=>{
    const token = req.cookies.accessToken
    if(!token){
        return res.status(401).json({status: "failed", success:"false", 
                         message: "You are not authorized"})
    }

    //if token exits then verifying it
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user)=>{
        if(err){
            return res.status(401).json({status: "failed", success:"false", 
                                         message: "Invalid Token"})
        }

        req.user = user
        next()
    })
}
export const verifyJWT = async (req, res, next) => {
    try {
     
        // Extract token from cookies or Authorization header
        const token =
            req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
   console.log(token,"kkkkkkkkkk")
        if (!token) {
            throw new ApiResponse(401, "Unauthorized request - No token provided");
        }
       
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Fetch the user from the database
     const { id, role } = decodedToken;
     console.log(id, role,"id and roll")

    let user;

    if (role =="user") {
      user = await User.findById(id).select("-password");
    } 
    else if (role =="child") {
        console.log("childdddddd")
      user = await Child.findById(id).select("-password");
    }
    else {
        console.log("admin.................................")
      user = await User.findById(id).select("-password");
    }
        console.log(user,"req.user")
        if (!user) {
            throw new ApiResponse(401, "Unauthorized request - User not found");
        }

        // Attach the user to the request object for further use
        req.user = user;
  
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // Handle JWT verification errors and other exceptions
        next(new ApiResponse(401, error?.message || "Unauthorized request"));
    }}


//2) TO VERIFY USER
export const verifyUser = (req, res, next)=>{

    verifyToken(req, res, next, ()=>{
        if(req.user.id === req.params.id || req.user.role === 'admin'){
            next()
        }else{
            return res.status(401).json({status: "failed", success:"false", 
                                         message: "You are not Authenticated"})
        }
    })

}

//3) TO VERIFY ADMIN
// export const verifyAdmin = (req, res, next) => {
//     verifyToken(req, res, next, () => {
//         console.log(`Role inside callback: '${req.user.role}'`);
//         if (req.user.role && req.user.role.trim() === 'admin') {
//             next();
//         } else {
//             return res.status(401).json({
//                 status: "failed",
//                 success: "false",
//                 message: "You are not Authorized"
//             });
//         }
//     });
// };
// middleware/verifyAdmin.js
export const verifyAdmin = (req, res, next) => {
    console.log(req.user.role,"req.user.role")
    if (req.user && req.user.role === "admin") {
        return next();
    } 
    return res.status(401).json({
        status: "failed",
        success: false,
        message: "You are not Authorized",
    });
};

