const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: "Error saving user" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found. Incorrect username." });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "30d",
      }
    );

    // update online status to true
    await User.findOneAndUpdate({ _id: user._id }, { online: true });

    // assign refresh token to http-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    res.status(200).json({ token: accessToken, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error logging in user" });
  }
};

const refreshToken = async (req, res) => {
  if (req.cookies?.refreshToken) {
    const refreshToken = req.cookies.refreshToken;
    const refreshTokenDecoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(406).json({ message: "Unauthorized" });
        } else {
          const user = await User.findById(decoded.id);
          if (!user) {
            return res.status(400).json({ message: "User not found" });
          }
          const accessToken = jwt.sign(
            {
              id: decoded.id,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "15m",
            }
          );
          return res.json({ token: accessToken, user });
        }
      }
    );
    res.cookie("refreshToken", refreshTokenDecoded, {
      httpOnly: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });
  } else {
    return res.status(406).json({ message: "Unauthorized" });
  }
};

const fetchToken = async (req, res) => {
  if (req.cookies?.refreshToken) {
    const refreshToken = req.cookies.refreshToken;
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(406).json({ message: "Unauthorized" });
        } else {
          const user = await User.findById(decoded.id);
          if (!user) {
            return res.status(400).json({ message: "User not found" });
          }
          const accessToken = jwt.sign(
            {
              id: decoded.id,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "15m",
            }
          );
          return res.json({ token: accessToken, user });
        }
      }
    );
  } else {
    return res.status(406).json({ message: "Unauthorized" });
  }
};

const fetchUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error getting user" });
  }
};

module.exports = { register, login, refreshToken, fetchToken, fetchUser };
