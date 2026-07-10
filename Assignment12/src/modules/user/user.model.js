import mongoose from "mongoose";
import { ProviderEnum, RoleEnum, GenderEnum } from "../../utils/enums/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM;
      }
    },
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER
    },
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    }, 
    profilePic:{
      type: String,
    },
    coverPic:{
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

 export default mongoose.model("User", userSchema);

