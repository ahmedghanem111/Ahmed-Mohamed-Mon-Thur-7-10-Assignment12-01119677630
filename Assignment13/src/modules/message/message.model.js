import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      min: 5,
      required: function () {
        return this.attachments?.length ? false : true
      }
    },
    attachments:{
      type:[String]
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  {
    timestamps: true,
    query:false,
    strictQuery: true
  }
);
 
export default mongoose.model("Message", messageSchema);
