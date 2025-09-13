import User from '../models/User.js'
import Child from '../models/Child.js'
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


export const createNewUser = async (req, res) => {
  const {
    username,
    email,
    password,
    role,
    age,
    gender,
    pregnancy,
    pregnancy_stage,
    preconception,
    general_health,
    phone_number
  } = req.body;

  const file = req.file?.path; // Multer saves the uploaded file locally
  let photoUrl = null;

  try {
    // Step 1: Upload photo to Cloudinary if provided
    if (file) {
      const cloudinaryResponse = await uploadOnCloudinary(file, "users");

      if (cloudinaryResponse) {
        photoUrl = cloudinaryResponse.secure_url; // Cloudinary secure URL
        console.log("Cloudinary URL:", photoUrl);
      } else {
        return res.status(500).json({
          status: "failed",
          success: false,
          message: "Photo upload to Cloudinary failed. User not created.",
        });
      }
    }

    // Step 2: Create new user with all fields
    const newUser = new User({
      username,
      email,
      password, // hashed automatically in schema
      role,
      age,
      gender,
      pregnancy,
      pregnancy_stage,
      preconception,
      general_health,
      phone_number,
      ...(photoUrl && { photo: photoUrl }), // only add photo if uploaded
    });

    console.log("New User:", newUser);

    // Step 3: Save user to DB
    const savedUser = await newUser.save();

    // Step 4: Send success response
    res.status(201).json({
      status: "success",
      success: true,
      message: "User successfully created",
      data: savedUser,
    });
  } catch (err) {
    console.error("Error creating user:", err);

    res.status(500).json({
      status: "failed",
      success: false,
      message: "User cannot be created. Try again.",
      error: err.message,
    });
  } finally {
    // Step 5: Clean up local file
    if (file) {
      import("fs").then((fs) => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    }
  }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
console.log(`User ${email}, ${password}`)
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        console.log(user,"user")
        if (!user) {
            return res.status(404).json({
                status: "failed",
                success: "false",
                message: "User not found",
            });
        }

        // Validate password
        const isPasswordValid = await user.comparePassword(password);
        console.log(isPasswordValid,"isPassword")
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "failed",
                success: "false",
                message: "Invalid credentials",
            });
        }
console.log(process.env.JWT_SECRET_KEY,"process.env.JWT_SECRET")
        // Create JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET_KEY,           
            { expiresIn: "1d" }              
        );

        // Send response with token
        res.status(200).json({
            status: "success",
            success: "true",
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (err) {
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Login failed",
            error: err.message,
        });
    }
};


export const updateUser = async (req, res) => {
    const id = req.query.id;
    const file = req.file?.path; // Multer saves the uploaded file locally
    let photoUrl = null;

    try {
        // Step 1: Handle photo upload if a file is provided
        if (file) {
            const cloudinaryResponse = await uploadOnCloudinary(file, 'users');

            if (cloudinaryResponse) {
                photoUrl = cloudinaryResponse.secure_url; // Use Cloudinary secure URL
                console.log('Cloudinary URL:', photoUrl);
            } else {
                return res.status(500).json({
                    status: 'failed',
                    success: 'false',
                    message: 'Photo upload to Cloudinary failed. User not updated.',
                });
            }
        }

        // Step 2: Prepare update object
        const updateData = { ...req.body };
        if (photoUrl) {
            updateData.photo = photoUrl; // Add Cloudinary photo URL if provided
        }

        // Step 3: Update user in the database
        const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({
                status: 'failed',
                success: 'false',
                message: 'User not found. Update failed.',
            });
        }

        // Step 4: Send success response
        res.status(200).json({
            status: 'success',
            success: 'true',
            message: 'User successfully updated',
            data: updatedUser,
        });

    } catch (err) {
        console.error('Error updating user:', err);

        res.status(500).json({
            status: 'failed',
            success: 'false',
            message: 'User cannot be updated. Try again.',
            error: err.message,
        });
    } finally {
        // Step 5: Clean up the locally uploaded file if it exists
        if (file) {
            import('fs').then(fs => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file); // Delete the file locally
                }
            });
        }
    }
};
 
//3) TO DELETE A USER
export const deleteUser = async (req, res) =>{

    const id = req.query.id

    try{
        await User.findByIdAndDelete(id)
        res.status(200).json({status: "success", success:"true", 
                             message: "User Sucessfully Deleted"})

    }catch(err){
         res.status(500).json({status: "failed", success:"false",
                             message: "User Cannot be Deleted. Try again"})
    }
}

//4) TO GET A SINGLE USER
// export const getSingleUser = async (req, res) =>{
// console.log("GET")
//     const id = req.query.id
  
//     try{
//         const singleUser = await User.findOne({_id:id})
        
//         res.status(200).json({status: "success", success:"true", 
//                              message: "Sucessful", data: singleUser})

//     }catch(err){
//          res.status(404).json({status: "failed", success:"false",
//                              message: "Error: User Data Not Found."})
//     }
// }
export const getSingleUser = async (req, res) => {
    console.log("GET Request for Single User");

    // Admins can pass the user ID in query; regular users access their own data
    const id = req.query.id || req.user._id;

    try {
        // Find user by ID
        const singleUser = await User.findOne({ _id: id }).select("-password -refreshToken"); // Exclude sensitive fields
        
        if (!singleUser) {
            return res.status(404).json({
                status: "failed",
                success: "false",
                message: "Error: User data not found.",
            });
        }

        res.status(200).json({
            status: "success",
            success: "true",
            message: "Successful",
            data: singleUser,
        });
    } catch (err) {
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Error: Could not fetch user data.",
            error: err.message,
        });
    }
};
//5) TO GET ALL USERS
export const getAllUsers = async (req, res) =>{

    try{
        const allUsers = await User.find({})
        res.status(200).json({status: "success", success:"true",
                             message: "Sucessful", count: allUsers.length, data: allUsers})

    }catch(err){
         res.status(404).json({status: "failed", success:"false",
                             message: "Error: Data Not Found."})
    }
};
export const createChild = async (req, res) => {
  try {
    const { name, age, gender, motherId,email, password } = req.body;

    // Check if mother exists
    const mother = await User.findById(motherId);
    if (!mother) {
      return res.status(404).json({ message: "Mother not found" });
    }

    // Create new child
    const newChild = new Child({
      name,
      age,
      gender,
      mother: motherId,
      email,
      password,
      role:"child"
    });

    const savedChild = await newChild.save();

    // Optionally push child into mother's children array
    mother.children.push(savedChild._id);
    await mother.save();

    res.status(201).json({
      message: "Child successfully created",
      data: savedChild,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating child",
      error: error.message,
    });
  }
};
export const getAllChildren = async (req, res) => {
  try {
    const motherId = req.user.id; // comes from JWT
    const children = await Child.find({ mother: motherId }).select("name age gender");

    res.status(200).json({
      message: "Children fetched successfully",
      count: children.length,
      data: children,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching children", error: error.message });
  }
};
// GET specific child (must belong to logged-in mother)
export const getChildById = async (req, res) => {
  try {
    console.log("requested user",req.user)
    const userId = req.user.id;   // logged-in user's ID from token
    const role = req.user.role;   // "mother" or "child"
    const childId = req.params.id; // requested childId

    let child;
console.log("here is the role")
    if (role === "user") {
      // Mother can only see her own child's data
      child = await Child.findOne({ _id: childId, mother: userId });
      if (!child) {
        return res.status(404).json({ message: "Child not found or not your child" });
      }

      // Mother sees full child details
      return res.status(200).json({
        message: "Child fetched successfully (mother view)",
        data: {
          id: child._id,
          name: child.name,
          age: child.age,
          gender: child.gender,
          school: child.school,
          view:"mother"
          // any other fields mother should see
        },
      });
    }

    if (role === "child") {
      // Child can only see their own profile
      if (childId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      child = await Child.findById(childId);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }

      // Child sees limited details about himself
      return res.status(200).json({
        message: "Child fetched successfully (child view)",
        data: {
          id: child._id,
          name: child.name,
          age: child.age,
          view:"child"
          // only safe fields for child himself
        },
      });
    }

    return res.status(403).json({ message: "Unauthorized role" });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching child",
      error: error.message,
    });
  }
};


export const childLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Child ${email}, ${password}`);

  try {
    // Check if the child exists
    const child = await Child.findOne({ email });
    console.log(child, "child");

    if (!child) {
      return res.status(404).json({
        status: "failed",
        success: "false",
        message: "Child not found",
      });
    }

    // Validate password
    const isPasswordValid = await child.comparePassword(password);
    console.log(isPasswordValid, "isPassword");

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "failed",
        success: "false",
        message: "Invalid credentials",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: child._id, role: "child" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    // Send response with token
    res.status(200).json({
      status: "success",
      success: "true",
      message: "Login successful",
      data: {
        token,
        user: {
          id: child._id,
          name: child.name,
          email: child.email,
          role: "child",
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      success: "false",
      message: "Login failed",
      error: err.message,
    });
  }
};

// export const childLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const child = await Child.findOne({ email });
//     if (!child) return res.status(404).json({ message: "Child not found" });
//     console.log(password, child.password)
//     const isMatch = await bcrypt.compare(password, child.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
//     const token = jwt.sign(
//       { id: child._id, role: "child" },
//       process.env.JWT_SECRET, 
//       { expiresIn: "1d" }
//     );

//     res.json({
//       token,
//       user: {
//         id: child._id,
//         name: child.name,
//         email: child.email,
//         role: "child"
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Login failed", error: err.message });
//   }
// };