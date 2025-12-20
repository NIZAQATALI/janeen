import User from '../models/User.js';
import Child from '../models/Child.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import VerificationCode from "../models/Verify.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { getPregnancyInfo } from "../utils/constant/userState.js"; 
import { getChildCategory } from "../utils/constant/childState.js"; 
import Notificationprefrence from '../models/Notificationprefrence.js';
import Notification from '../models/Notification.js';
import { sendInactiveUserEmail } from '../utils/email.js';
import { awardPoints } from '../utils/gamification/pointservice.js';
export const createNewUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      age,
      gender,
      maritalStatus,
      pregnancyStage,
      trimester,
      fatherStatus,
      general_health,
      phone_number,
      pregnancyStartDate,
      verificationCode,
    } = req.body;

    const file = req.file?.path;
    let photoUrl = null;

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required.",
      });
    }

    const normalizedEmail = email.toLowerCase();
console.log(email)
console.log(normalizedEmail,"normalized email")
    console.log("Verification Code:", verificationCode, "Type:", typeof verificationCode);

    // Check if verification code exists and not expired
    const validCode = await VerificationCode.findOne({
      email: normalizedEmail,
      code: String(verificationCode).trim(),
      expiresAt: { $gt: new Date() },
    });

    console.log("Valid code found:", validCode);

    if (!validCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    // Upload profile photo if provided
    if (file) {
      const cloudinaryResponse = await uploadOnCloudinary(file, "users");
      if (cloudinaryResponse) {
        photoUrl = cloudinaryResponse.secure_url;
      } else {
        return res.status(500).json({
          success: false,
          message: "Photo upload to Cloudinary failed.",
        });
      }
    }

    // Create new user
    const newUser = new User({
      username,
      email: normalizedEmail,
      password,
      role,
      age,
      gender,
      maritalStatus,
      pregnancyStage,
      trimester,
      fatherStatus,
      general_health,
      phone_number,
      pregnancyStartDate,
      ...(photoUrl && { photo: photoUrl }),
    });

    const savedUser = await newUser.save();

    // Delete used verification code
    await VerificationCode.deleteOne({ _id: validCode._id });

    return res.status(201).json({
      success: true,
      message: "User successfully created and verified.",
      data: savedUser,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({
      success: false,
      message: "User cannot be created. Try again.",
      error: err.message,
    });
  }
};
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "failed",
        success: false,
        message: "User not found",
      });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "failed",
        success: false,
        message: "Invalid credentials",
      });
    }

      user.lastLogin = new Date();
      await awardPoints({
  userId: user._id,
  type: "LOGIN"
});
    await user.save();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      status: "success",
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.gender.toLowerCase(),
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      success: false,
      message: "Login failed",
      error: err.message,
    });
  }
};
export const getLiveLeaderboard = async (req, res) => {
  const users = await User.find()
    .select("username points photo")
    .sort({ points: -1 })
    .limit(50);

  res.json({ success: true, data: users });
};
const generateLeaderboardSnapshot = async (period) => {
  const users = await User.find().sort({ points: -1 }).limit(100);

  const ranked = users.map((u, i) => ({
    userId: u._id,
    points: u.points,
    rank: i + 1
  }));

  await Leaderboard.create({
    period,
    users: ranked,
    createdAt: new Date()
  });
};


export const updateUser = async (req, res) => {
  const id = req.query.id;
  const file = req.file?.path;
  let photoUrl = null;
  try {
    if (file) {
      const cloudinaryResponse = await uploadOnCloudinary(file, 'users');
      if (cloudinaryResponse) {
        photoUrl = cloudinaryResponse.secure_url;
      } else {
        return res.status(500).json({
          status: 'failed',
          success: false,
          message: 'Photo upload failed. User not updated.',
        });
      }
    }
    const updateData = { ...req.body };
    if (photoUrl) updateData.photo = photoUrl;
    const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({
        status: 'failed',
        success: false,
        message: 'User not found. Update failed.',
      });
    }

    res.status(200).json({
      status: 'success',
      success: true,
      message: 'User successfully updated',
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      success: false,
      message: 'User cannot be updated. Try again.',
      error: err.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.query.id;
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      success: true,
      message: "User successfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      success: false,
      message: "User cannot be deleted. Try again",
    });
  }
};

export const getSingleUser = async (req, res) => {
  const id =  req.user._id;
console.log(id,"id.............")
  try {
    const singleUser = await User.findOne({ _id: id }).select("-password");
    console.log(singleUser,"singleUser")
    if (!singleUser) {
      return res.status(404).json({
        status: "failed",
        success: false,
        message: "User not found.",
      });
    }

    const pregnancyInfo = getPregnancyInfo(singleUser);
    const preference = await Notificationprefrence.find({ userId: singleUser._id });
    const notifications = await Notification.find({ userId: singleUser._id, status: "scheduled" });

    res.status(200).json({
      status: "success",
      success: true,
      message: "User fetched successfully",
      data: {
        ...singleUser.toObject(),
        pregnancyInfo,
        notificationPreferences: preference,
        pendingNotifications: notifications,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      success: false,
      message: "Could not fetch user data.",
      error: err.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.status(200).json({
      status: "success",
      success: true,
      message: "Successful",
      count: allUsers.length,
      data: allUsers,
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      success: false,
      message: "Data not found.",
    });
  }
};
// export const getAppAnalytics = async (req, res) => {
//   try {
  
//     const totalUsers = await User.countDocuments();
//     const totalChildren = await Child.countDocuments();

  
//     const totalAppUsers = totalUsers + totalChildren;

   
//     const maleUsers = await User.countDocuments({ gender: "Male" });
//     const femaleUsers = await User.countDocuments({ gender: "Female" });

   
//     const pregnantWomen = await User.countDocuments({
//       gender: "Female",
//       pregnancyStage: "Pregnancy",
//     });

   
//     const nonPregnantWomen = await User.countDocuments({
//       gender: "Female",
//       pregnancyStage: { $ne: "Pregnancy" },
//     });

//     const fathers = await User.countDocuments({
//       gender: "Male",
//       fatherStatus: "Father",
//     });

  
//     const marriedWomen = await User.countDocuments({
//       gender: "Female",
//       maritalStatus: "Married",
//     });

    
//     const usersWithChildren = await User.countDocuments({
//       children: { $exists: true, $ne: [] },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "App analytics fetched successfully",
//       data: {
//         totalAppUsers,   
//         totalUsers,     
//         totalChildren,   
//         genderStats: {
//           maleUsers,
//           femaleUsers,
//         },
//         pregnancyStats: {
//           pregnantWomen,
//           nonPregnantWomen,
//         },
//         parentStats: {
//           fathers,
//           marriedWomen,
//           usersWithChildren,
//         },
//       },
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch analytics",
//       error: error.message,
//     });
//   }
// };
// ------------------ CHILD CONTROLLERS ------------------
// export const getAppAnalytics = async (req, res) => {
//   try {
//     const now = new Date();

//     const totalUsers = await User.countDocuments();
//     const totalChildren = await Child.countDocuments();
//     const totalAppUsers = totalUsers + totalChildren;

//     /* -------------------- TIME RANGES -------------------- */
//     const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
//     const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
//     const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);

//     /* -------------------- ACTIVE USERS -------------------- */
//     const activeToday = await User.countDocuments({
//       lastLogin: { $gte: last24Hours }
//     });

//     const activeThisWeek = await User.countDocuments({
//       lastLogin: { $gte: last7Days }
//     });

//     const activeThisMonth = await User.countDocuments({
//       lastLogin: { $gte: last30Days }
//     });

//     /* -------------------- INACTIVE USERS -------------------- */
//     const inactiveUsers = await User.find({
//       $or: [
//         { lastLogin: { $lt: last30Days } },
//         { lastLogin: null }
//       ]
//     }).select("name email phone lastLogin gender");

//     const inactiveUsersCount = inactiveUsers.length;

//     /* -------------------- GENDER -------------------- */
//     const maleUsers = await User.countDocuments({ gender: "Male" });
//     const femaleUsers = await User.countDocuments({ gender: "Female" });

//     /* -------------------- PREGNANCY -------------------- */
//     const pregnantWomen = await User.countDocuments({
//       gender: "Female",
//       pregnancyStage: "Pregnancy",
//     });

//     const nonPregnantWomen = await User.countDocuments({
//       gender: "Female",
//       pregnancyStage: { $ne: "Pregnancy" },
//     });

//     /* -------------------- PARENTHOOD -------------------- */
//     const fathers = await User.countDocuments({
//       gender: "Male",
//       fatherStatus: "Father",
//     });

//     const marriedWomen = await User.countDocuments({
//       gender: "Female",
//       maritalStatus: "Married",
//     });

//     const usersWithChildren = await User.countDocuments({
//       children: { $exists: true, $ne: [] },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Analytics fetched successfully",
//       data: {
//         total: {
//           totalAppUsers,
//           totalUsers,
//           totalChildren,
//         },

//         activity: {
//           activeToday,
//           activeThisWeek,
//           activeThisMonth,
//           inactiveUsersCount,
//           inactiveUsersDetails: inactiveUsers, // for email/SMS engagement
//         },

//         genderStats: {
//           maleUsers,
//           femaleUsers,
//         },

//         pregnancyStats: {
//           pregnantWomen,
//           nonPregnantWomen,
//         },

//         parentStats: {
//           fathers,
//           marriedWomen,
//           usersWithChildren,
//         },
//       },
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch analytics",
//       error: error.message,
//     });
//   }
// };
export const getAppAnalytics = async (req, res) => {
  try {
    const now = new Date();

    const totalUsers = await User.countDocuments();
    const totalChildren = await Child.countDocuments();
    const totalAppUsers = totalUsers + totalChildren;

    /* -------------------- TIME RANGES -------------------- */
    const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);

    /* -------------------- ACTIVE USERS -------------------- */
    const activeToday = await User.countDocuments({
      lastLogin: { $gte: last24Hours }
    });

    const activeThisWeek = await User.countDocuments({
      lastLogin: { $gte: last7Days }
    });

    const activeThisMonth = await User.countDocuments({
      lastLogin: { $gte: last30Days }
    });

    /* -------------------- INACTIVE USERS -------------------- */
    const inactiveUsers = await User.find({
      $or: [
        { lastLogin: { $lt: last30Days } },
        { lastLogin: null }
      ]
    }).select("name email phone lastLogin gender");

    const inactiveUsersCount = inactiveUsers.length;

    /* -------------------- GENDER -------------------- */
    const maleUsers = await User.countDocuments({ gender: "Male" });
    const femaleUsers = await User.countDocuments({ gender: "Female" });

    /* -------------------- PREGNANCY -------------------- */
    const pregnantWomen = await User.countDocuments({
      gender: "Female",
      pregnancyStage: "Pregnancy",
    });

    const nonPregnantWomen = await User.countDocuments({
      gender: "Female",
      pregnancyStage: { $ne: "Pregnancy" },
    });

    /* -------------------- PARENTHOOD -------------------- */
    const fathers = await User.countDocuments({
      gender: "Male",
      fatherStatus: "Father",
    });

    const marriedWomen = await User.countDocuments({
      gender: "Female",
      maritalStatus: "Married",
    });

    const usersWithChildren = await User.countDocuments({
      children: { $exists: true, $ne: [] },
    });

    /* -------------------- CHILD BREAKDOWN -------------------- */
    const childrenWithParent = await Child.countDocuments({ parent: { $ne: null } });

    const childrenWithoutParent = await Child.countDocuments({ parent: null });

    const activeChildren = await Child.countDocuments({
      lastLogin: { $gte: last30Days }
    });

    const inactiveChildren = await Child.countDocuments({
      $or: [
        { lastLogin: { $lt: last30Days } },
        { lastLogin: null }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Analytics fetched successfully",
      data: {
        total: {
          totalAppUsers,
          totalUsers,
          totalChildren,
        },

        activity: {
          activeToday,
          activeThisWeek,
          activeThisMonth,
          inactiveUsersCount,
          inactiveUsersDetails: inactiveUsers,
        },

        genderStats: {
          maleUsers,
          femaleUsers,
        },

        pregnancyStats: {
          pregnantWomen,
          nonPregnantWomen,
        },

        parentStats: {
          fathers,
          marriedWomen,
          usersWithChildren,
        },

        childStats: {
          totalChildren,
          childrenWithParent,
          childrenWithoutParent,
          activeChildren,
          inactiveChildren,
        }
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};


// export const createChild = async (req, res) => {
//   try {
//     const { name, age, gender, parentId, email, password, category, ageRange,birthDate } = req.body;
//     const parent = await User.findById(parentId);
//     if (!parent) {
//       return res.status(404).json({ message: "Parent not found" });
//     }
//     const newChild = new Child({
//       name,
//       age,
//       gender,
//       birthDate,
//       parent: parentId,
//       email,
//       password,
//       role: "child",
//       category,
//       ageRange,
//     });
//     const savedChild = await newChild.save();

//     parent.children.push(savedChild._id);
//     await parent.save();

//     res.status(201).json({
//       message: "Child successfully created",
//       data: savedChild,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error creating child",
//       error: error.message,
//     });
//   }
// };
export const createChild = async (req, res) => {
  try {
    const { 
      name, 
      gender, 
      email, 
      password, 
      category, 
      ageRange, 
      birthDate, 
      parentId 
    } = req.body;

    let parent = null;

   
    if (parentId) {
      parent = await User.findById(parentId);
      if (!parent) {
        return res.status(404).json({ success: false, message: "Parent not found" });
      }
    }

    const newChild = new Child({
      name,
      gender,
      email,
      password,
      category,
      ageRange,
      birthDate,
      parent: parentId || null,   // ← KEY POINT
      role: "child",
    });

    const savedChild = await newChild.save();

    // If child is created under a parent, add to parent.children list
    if (parent) {
      parent.children.push(savedChild._id);
      await parent.save();
    }

    res.status(201).json({
      success: true,
      message: parent ? "Child created and linked to parent" : "Child created without parent",
      data: savedChild,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating child",
      error: error.message,
    });
  }
};


export const getAllChildren = async (req, res) => {
  try {
    const parentId = req.user.id; 
    const children = await Child.find({ parent: parentId }).select("name age gender category ageRange");

    res.status(200).json({
      message: "Children fetched successfully",
      count: children.length,
      data: children,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching children", error: error.message });
  }
};


// export const getChildById = async (req, res) => {
//   try {
//     const { id: userId, role } = req.user;
//     const { id: childId } = req.params;

//     let child;

//     if (role === "user") {
//       child = await Child.findOne({ _id: childId, parent: userId });
//       if (!child) {
//         return res.status(404).json({ message: "Child not found or not your child" });
//       }
//       return res.status(200).json({
//         message: "Child fetched successfully (parent view)",
//         data: child,
//       });
//     }

//     if (role === "child") {
//       if (userId !== childId) {
//         return res.status(403).json({ message: "Access denied — you can only view your own data" });
//       }

//       child = await Child.findById(childId);
//       if (!child) {
//         return res.status(404).json({ message: "Child not found" });
//       }

//       return res.status(200).json({
//         message: "Child fetched successfully (child view)",
//         data: {
//           id: child._id,
//           name: child.name,
//           age: child.age,
//           category: child.category,
//           ageRange: child.ageRange,
//         },
//       });
//     }

//     return res.status(403).json({ message: "Unauthorized role" });
//   } catch (error) {
//     console.error("Error fetching child:", error);
//     return res.status(500).json({
//       message: "Error fetching child",
//       error: error.message,
//     });
//   }
// };

export const getChildById = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { id: childId } = req.params;

    let child;

  
    if (role === "user") {
      child = await Child.findOne({ _id: childId, parent: userId });
      if (!child) {
        return res.status(404).json({
          message: "Child not found or not your child",
        });
      }

    
      const childState = getChildCategory(child);

      return res.status(200).json({
        message: "Child fetched successfully (parent view)",
        data: {
          ...child.toObject(),
          childState, 
        },
      });
    }

    // 👦 Child accessing their own data
    if (role === "child") {
      if (userId !== childId) {
        return res.status(403).json({
          message: "Access denied — you can only view your own data",
        });
      }

      child = await Child.findById(childId);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }

    
      const childState = getChildCategory(child);

      return res.status(200).json({
        message: "Child fetched successfully (child view)",
        data: {
          id: child._id,
          name: child.name,
          email: child.email,
          gender: child.gender,
          category: child.category,
          ageRange: child.ageRange,
          childState,
        },
      });
    }

    return res.status(403).json({ message: "Unauthorized role" });
  } catch (error) {
    console.error("Error fetching child:", error);
    return res.status(500).json({
      message: "Error fetching child",
      error: error.message,
    });
  }
};


export const childLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const child = await Child.findOne({ email });
    if (!child) {
      return res.status(404).json({
        status: "failed",
        success: false,
        message: "Child not found",
      });
    }
    const isPasswordValid = await child.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "failed",
        success: false,
        message: "Invalid credentials",
      });
    }
  child.lastLogin = new Date();
    await child.save();
    const token = jwt.sign(
      { id: child._id, role: "child" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      status: "success",
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: child._id,
          name: child.name,
          email: child.email,
          role: "child",
          category: child.category,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      success: false,
      message: "Login failed",
      error: err.message,
    });
  }
};
export const sendInactiveUserEmailController = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: "User does not have a valid email.",
      });
    }

  
    await sendInactiveUserEmail(user.email, user.username);

    return res.status(200).json({
      success: true,
      message: "Engagement email sent successfully.",
    });

  } catch (error) {
    console.error("Error sending inactive user email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email.",
      error: error.message,
    });
  }
};