import User from '../models/User.js';
import Child from '../models/Child.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
// Create a new user
export const createNewUser = async (req, res) => {
  const {
    username,
    email,
    password,
    role,
    age,
    gender,
    maritalStatus,
    pregnancyStage,   // updated
    trimester,        // updated
    fatherStatus,     // updated
    general_health,
    phone_number
  } = req.body;

  const file = req.file?.path;
  let photoUrl = null;

  try {
    if (file) {
      const cloudinaryResponse = await uploadOnCloudinary(file, "users");
      if (cloudinaryResponse) {
        photoUrl = cloudinaryResponse.secure_url;
      } else {
        return res.status(500).json({
          status: "failed",
          success: false,
          message: "Photo upload to Cloudinary failed. User not created.",
        });
      }
    }

    const newUser = new User({
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
      ...(photoUrl && { photo: photoUrl }),
    });

    const savedUser = await newUser.save();

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
  }
};

// Login User
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

// Update User
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

// Delete User
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

// Get Single User
export const getSingleUser = async (req, res) => {
  const id = req.query.id || req.user._id;
  try {
    const singleUser = await User.findOne({ _id: id }).select("-password");
    if (!singleUser) {
      return res.status(404).json({
        status: "failed",
        success: false,
        message: "User not found.",
      });
    }
    res.status(200).json({
      status: "success",
      success: true,
      message: "Successful",
      data: singleUser,
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

// Get All Users
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

// ------------------ CHILD CONTROLLERS ------------------

// Create Child
export const createChild = async (req, res) => {
  try {
    const { name, age, gender, parentId, email, password, category, ageRange } = req.body;

    const parent = await User.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const newChild = new Child({
      name,
      age,
      gender,
      parent: parentId,
      email,
      password,
      role: "child",
      category,
      ageRange,
    });

    const savedChild = await newChild.save();

    parent.children.push(savedChild._id);
    await parent.save();

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

// Get All Children for parent
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

// Get child by ID
export const getChildById = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const childId = req.params.id;

    let child;

    if (role === "user") {
      child = await Child.findOne({ _id: childId, parent: userId });
      if (!child) {
        return res.status(404).json({ message: "Child not found or not your child" });
      }
      return res.status(200).json({
        message: "Child fetched successfully (parent view)",
        data: child,
      });
    }

    if (role === "child") {
      if (childId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      child = await Child.findById(childId);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }

      return res.status(200).json({
        message: "Child fetched successfully (child view)",
        data: {
          id: child._id,
          name: child.name,
          age: child.age,
          category: child.category,
          ageRange: child.ageRange,
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

// Child Login
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
