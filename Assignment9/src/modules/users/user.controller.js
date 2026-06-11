import User from "./user.model.js";
import bcrypt from "bcrypt";
import { encrypt } from "../../utils/encryption.js";
import { generateToken } from "../../utils/token.js";

export const signup = async (req, res) => {
  const { name, email, password, phone, age } = req.body;

  const exists = await User.findOne({ email });

  if (exists) {
    return res.json({ message: "Email already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  const encryptedPhone = encrypt(phone);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone: encryptedPhone,
    age,
  });

  res.json({
    message: "User created",
    user,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: "Invalid email" });
  }

  const match = bcrypt.compareSync(
    password,
    user.password
  );

  if (!match) {
    return res.json({ message: "Invalid password" });
  }

  const token = generateToken({
    userId: user._id,
  });

  res.json({
    message: "Done",
    token,
  });
};

export const updateUser = async (req, res) => {
  const userId = req.user.userId;

  if (req.body.email) {
    const exists = await User.findOne({
      email: req.body.email,
      _id: { $ne: userId },
    });

    if (exists) {
      return res.json({
        message: "Email already exists",
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    req.body,
    { new: true }
  );

  res.json({
    message: "Updated",
    user,
  });
};

export const deleteUser = async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findByIdAndDelete(userId);

  res.json({
    message: "Deleted",
    user,
  });
};

export const getUser = async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId);

  res.json({
    message: "Done",
    user,
  });
};