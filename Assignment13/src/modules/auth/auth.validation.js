import joi from "joi";
import mongoose from "mongoose";

export const loginSchema = {
  body: joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).max(30)
  })
}


export const profileSchema = {
  query: joi.object({
    search: joi.string().min(6).max(100)
  }),
  params: joi.object({
    id: joi.string().custom((value, helpers) => {
      const isValid = mongoose.ValidateObjectId(value);
        if (isValid) {
          return true
        }else {
          return helpers.message("Invalid User Id")
        } 
      })
  })
}


export const registerSchema = {
  body: joi.object({
    userName: joi.string().min(3).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).max(30).required(),
  })
};
