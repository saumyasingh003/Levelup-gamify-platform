import User from "../models/user.js";
import Progress from "../models/progress.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// REGISTER USER
export const register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      githubLink,
      leetcodeLink,
      linkedinLink,
      year
    } = req.body;

    // check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      githubLink,
      leetcodeLink,
      linkedinLink,
      year
    });

    // generate jwt token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Generated Token:", token);

    // store cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log(`[Auth] User registered successfully: ${user.email} (${user._id})`);

    res.status(201).json({
      message: "User Registered Successfully",
      token,
      email: user.email,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        year: user.year
      }
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error.message
    });

  }

};



// LOGIN USER
export const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password"
      });
    }

    // create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

  

    // save cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login Successful",
      token,
      email: user.email,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        year: user.year
      }
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error.message
    });

  }

};



// LOGOUT USER
export const logout = async (req, res) => {

  try {

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0)
    });

    res.status(200).json({
      message: "Logout Successful"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// GET PROFILE
export const getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Include basic progress for career-hub context
    const progress = await Progress.findOne({ user: user._id });
    
    res.status(200).json({ 
      ...user.toObject(), 
      progress: progress ? { career: progress.career, level: progress.level } : null 
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// UPDATE PROFILE
export const updateProfile = async (req, res) => {

  try {

    const {
      name,
      email,
      githubLink,
      leetcodeLink,
      linkedinLink,
      year
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.githubLink = githubLink || user.githubLink;
    user.leetcodeLink = leetcodeLink || user.leetcodeLink;
    user.linkedinLink = linkedinLink || user.linkedinLink;
    user.year = year || user.year;

    const updatedUser = await user.save();
    console.log(`[Auth] Profile updated for user: ${user.email} (${user._id})`);

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};