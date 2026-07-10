import User from "../user/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "../../utils/security/token/token.js";
import { decodeToken, TokenType } from "../../middleware/auth.middleware.js";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../utils/enums/user.enum.js";
import generateHtml from "../../utils/Email/html.template.js";
import { sendEmail } from "../../utils/Email/sendEmail.js";
import { createOtp } from "../../utils/Email/otp.js";
import { redisClient } from "../../utils/redis/redis.client.js";
import { nanoid } from "nanoid"
import { revokeTokenKey } from "../../utils/redis/redis.services.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const isExist = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (isExist) {
      return res.status(409).json({
        message: "Email or Username already exists",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const otp = createOtp()
    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
    });
    await redisClient.set(`Users:${user._id}:emailConfirmationOtp`, otp, {
      expiration:{
        type: "EX",
        value: 5*60
      }
    })
    sendEmail({
      to: user.email,
      subject: "confirm your email",
      html: generateHtml(otp),
    })

    res.status(201).json({
      message: "User Created Successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const confirmEmail = async (req, res) =>{
  const { email, otp } = req.body
  const user = await User.findOne({ email })

  if(user.emailConfirmed){
    return res.status(404).json({
      message: "Already confirmed",
    });
  }

  const userOtp = await redisClient.get(`Users:${user._id}:emailConfirmationOtp`)
  
  if(!userOtp){
    return res.status(404).json({
      message: "invalid or expired otp",
    });
  }

  if(userOtp != otp){
    return res.status(404).json({
      message: "invalid or expired otp",
    });
  }

  await redisClient.del(`Users:${user._id}:emailConfirmationOtp`)


  user.emailConfirmed = true  
  user.otp = undefined
  await user.save()

  return res.status(200).json({
    message: "Confirmed",
  });

}


export const resendOtp = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "user not found",
    });
  }

  if(user.emailConfirmed){
    return res.status(404).json({
      message: "Already confirmed",
    });
  }

  const isOtpExist = await redisClient.get(`Users:${user._id}:emailConfirmationOtp`)
  if(isOtpExist){
    const ttl = await redisClient.TTL(`Users:${user._id}:emailConfirmationOtp`)
    return res.status(404).json({
      message: `wait ${ttl} seconds to resend otp`,
    });
  }

  const otp = createOtp()
  await redisClient.set(`Users:${user._id}:emailConfirmationOtp`, otp, {
    expiration:{
      type: "EX",
      value: 5*60
    }
  })
  sendEmail({
    to: user.email,
    subject: "confirm your email",
    html: generateHtml(otp),
  })

  return res.status(200).json({
    message: "Done",
  });
}


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Invalid Email or Password",
      });
    }
    if(user.provider > ProviderEnum.SYSTEM) {
      return res.status(400).json({
        message: "Please login using your social account",
      });
    }

    const match = bcrypt.compareSync(
      password,
      user.password
    );

    if (!match) {
      return res.status(404).json({
        message: "Invalid Email or Password",
      });
    }

    const jti = nanoid()
    const accessToken = generateToken(
      {
      id: user._id,
      email: user.email,
      role: user.role
      },
      process.env.ACCESS_JWT_SECRET,
      { 
        expiresIn: "10m",
        jwtid: jti

      }
    ) 
    const refreshToken = generateToken(
            {
      id: user._id,
      email: user.email,
      role: user.role
      },
      process.env.REFRESH_JWT_SECRET,
      { 
        expiresIn: "7d",
        jwtid: jti

      }
    ) 

    redisClient.set(revokeTokenKey(user._id, jti), jti, {
      expiration: {
        type: "EX",
        value: 7 * 24 * 60 * 60
      }
    })
    res.status(200).json({
      message: "Login Success",
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const logout = async (req, res, next) =>{
  const user = req.user
  const payload = req.decodedToken
  const key = revokeTokenKey(user._id, payload.jti)
  await redisClient.del(key)
  return res.status(200).json({
    message: "Done",
  });
}


export const logoutFromAllDevices = async (req, res, next) =>{
  const user = req.user
  let keys = await redisClient.keys(`Users:login:${req.user._id}:*`)
  await redisClient.del(keys)
  return res.status(200).json({
    message: "Done",
  });
}


export const profile = async (req, res, next) => {

  return res.status(200).json({
    message: "User Profile",
    user: req.user,
  });

}


export const refreshToken = async (req, res) => {
    const authorization = req.headers.authorization 
    
    const { user } = await decodeToken(authorization, TokenType.refresh)

    const accessToken = generateToken(
      {
      id: user._id,
      email: user.email,
      role: user.role
      },
      process.env.ACCESS_JWT_SECRET,
      { expiresIn: "10m" }
    )
    return res.status(200).json({
      message: "Access Token Generated Successfully",
      accessToken,
    });
}


export const socialLogin = async (req, res) => {
  const { idToken } = req.body;
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const {email, name} = ticket.getPayload();

  let user = await User.findOne({ email });
  if (user) {

    if(user.provider == ProviderEnum.SYSTEM) {
      return res.status(400).json({
        message: "Please login using your email and password",
      });
    }

  }else {
    user = await User.create({
      userName: name,
      email,
      provider: ProviderEnum.GOOGLE,
    }); 
  }

  return res.status(200).json({
    message: "Login Success",
    email,
    userName: name 
  });

    const accessToken = generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  },
    process.env.ACCESS_JWT_SECRET,
    { 
      expiresIn: "10m"
    }
  ) 
  const refreshToken = generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  },
    process.env.REFRESH_JWT_SECRET,
    { 
      expiresIn: "7d"
    }
  ) 
  res.status(200).json({
    message: "Login Success",
    accessToken,
    refreshToken
  });   
} 

