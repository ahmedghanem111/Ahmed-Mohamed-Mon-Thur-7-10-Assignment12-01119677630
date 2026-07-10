import Message from "./message.model.js";
import { encrypt, decrypt } from "../../utils/encryption.js";



export const sendMessage = async (req, res) => {
  try {

    const { receiverId } = req.params;

    const { content } = req.body;
    const encryptedMessage = encrypt(content);

    const message =
      await Message.create({
        content: encryptedMessage,
        receiverId,
      });

    res.status(201).json({
      message: "Message Sent",
      data: message,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

 


export const getMessages = async (req, res) => {
  try {

    const messages =
      await Message.find({
        receiverId: req.user.id,
      });
    
    const decryptedMessages = messages.map((msg) => {
        return {
         ...msg.toObject(),
         content: decrypt(msg.content),
        };
    });  

    res.status(200).json({
      messages: decryptedMessages,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};




export const deleteMessage = async (req, res) => {
  try {

    const { messageId } = req.params;

    const message =
      await Message.findOne({
        _id: messageId,
        receiverId: req.user.id,
      });

    if (!message) {
      return res.status(404).json({
        message: "Message Not Found",
      });
    }

    await Message.findByIdAndDelete(
      messageId
    );

    res.status(200).json({
      message: "Deleted Successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};