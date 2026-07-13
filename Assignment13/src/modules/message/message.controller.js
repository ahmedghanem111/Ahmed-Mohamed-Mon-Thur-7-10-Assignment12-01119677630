import Message from "./message.model.js";
import { encrypt, decrypt } from "../../utils/encryption.js";
import User from "../user/user.model.js";


export const sendMessage = async (req, res) => {

    const {content, to } = req.body;
    const { files } = req
    console.log({ files })
    
    const receiver = await User.findById(to)
    if (!receiver) {
      return res.status(404).json({
        message: "invalid receiver id",
      });
    }
    let attachments = []
    if (req.files?.length) {
      attachments = req.files.map((ele) => ele.path)
    } 

    // const encryptedMessage = encrypt(content);
    const message =
      await Message.create({
        content,
        attachments,
        receiver: receiver._id
      });

    res.status(201).json({
      message: "Message Sent",
      data: message,
    });
};


export const getMessages = async (req, res) => {
  
  const user = req.user
  const messages = await Message.find({
      receiver: user._id,
    }).select(`-receiver -__v -updatedAt`)

  return res.status(200).json({
    data: { 
      user: {
        _id: user._id,
        userName: user.userName,
        messages
      }
    }
  })
};


export const deleteMessage = async (req, res) => {
  const user = req.user
  const { messageId } = req.params;

  const message =
    await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message Not Found",
      });
    }
    if (message.receiver.toString() != user._id.toString()) {
        return res.status(404).json({
        message: "not authorized to delete this message",
      });
    }

    await Message.findByIdAndDelete(
      messageId
    );

    res.status(200).json({
      message: "Deleted Successfully",
    });

};