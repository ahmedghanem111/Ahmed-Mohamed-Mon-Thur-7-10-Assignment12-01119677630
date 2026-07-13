import User from "../user/user.model.js";
import bcrypt, { compare, hash } from "bcrypt";
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
import { confirmEmailKey, forgetPasswordKey, revokeTokenKey, confirmOldEmailKey, newEmailKey } from "../../utils/redis/redis.services.js";

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


export const forgetPassword = async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "user not found",
    });
  }
  const savedOtp = await redisClient.get(forgetPasswordKey(user._id))
  if(savedOtp){
    const ttl = await redisClient.ttl(forgetPasswordKey(user._id))
      return res.status(404).json({
        message: `wait ${ttl} seconds to reset otp`,
      });
  }
  const otp = createOtp()
  await redisClient.set(forgetPasswordKey(user._id), otp, {
    expiration:{
      type: "EX",
      value: 5 * 60
    }
  })
  sendEmail({
    to: email,
    subject: "Forget Password",
    html: generateHtml(otp)
  })

  return res.status(201).json({
    message: "Done"
  });

}


export const resetPassword = async (req, res) => {
  const { otp, newPass, email } = req.body
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "user not found",
    });
  }
  const savedOtp = await redisClient.get(forgetPasswordKey(user._id))
  if(!savedOtp){
    return res.status(404).json({
      message: "send otp first",
    });
  }
  if(savedOtp != otp){
    return res.status(404).json({
      message: "invalid otp",
    });
  }
  user.password = await hash(newPass,8)
  await user.save()
  redisClient.del(forgetPasswordKey(user._id))
  return res.status(201).json({
    message: "Done"
  });
}


export const updatePassword = async (req, res) => {
  const user = req.user
  const { oldPass, newPass } = req.body
  if(!compare(oldPass, user.password)){
    return res.status(404).json({
      message: "invalid old password",
    });
  }
  user.password = await hash(newPass,8)
  await user.save()
  return res.status(201).json({
    message: "Done"
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


export const updateEmail = async (req, res) => {
  const user = req.user
  const { newEmail } = req.body
  if(newEmail == user.email){
    return res.status(404).json({
      message: "send new email",
    });
  }
  if(await User.findOne({email: newEmail})){
    return res.status(404).json({
      message: "send new email",
    }); 
  }
  const oldKey = confirmEmailKey(user._id)
  const newKey = confirmOldEmailKey(user._id)
  const newOtp = createOtp()
  const oldOtp = createOtp()

  await redisClient.set(newKey, newOtp, {
    expiration: {
      type: "EX",
      value: 5 * 60
    }
  })

  sendEmail({
    to: newEmail,
    subject: "new email confirmation",
    html: generateHtml(newOtp)
  })
  await redisClient.set(oldKey, oldOtp, {
    expiration: {
      type: "EX",
      value: 5 * 60
    }
  })
  sendEmail({
    to: user.email,
    subject: "old email confirmation",
    html: generateHtml(oldOtp)
  })

  await redisClient.set(newEmailKey(user._id), newEmail, {
    expiration: {
      type: "EX",
      value: 5 * 60
    }
  })
  return res.status(201).json({
    message: "Done"
  });
}


export const confirmUpdateEmail = async (req, res) =>{
  const user = req.user
  const {newOtp, oldOtp} = req.body
  const newKey = await confirmEmailKey(user._id)
  const oldKey = await confirmOldEmailKey(user._id)
  const newSavedOtp = await redisClient.get(newKey)
  const oldSavedOtp = await redisClient.get(oldKey)

  if (!(newSavedOtp && oldSavedOtp) || (newOtp != newSavedOtp || oldOtp != oldSavedOtp )) {
    return res.status(404).json({
      message: "invalid otp",
    }); 
  }
  const newEmail = await redisClient.get(newEmailKey(user._id)) 
  user.email = newEmail
  await user.save()
  return res.status(201).json({
    message: "Done"
  });
} 
