import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../lib/cloudinary.js';
import { getReceiverSocketId, io } from '../lib/socket.js';


export async function getUsersForSidebar(req, res) {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id: { $ne: authuserId } }).select('-password');
        res.status(200).json(filteredUsers);
    }
    catch (error) {
        console.log('Error in getUsersForSidebar: ', error.message)
        res.status(500).json({ message: 'Internal Server Error in getUsersForSidebar'});
    }
}

export async function getMessages(req, res) {
    try {
      // 1
      const { id: userToChatId } = req.params;
      const myId = req.user._id;
      // 2
      const messages = await Message.find({
        $or: [
            { senderId: myId, receiverId: userToChatId },
            { senderId: userToChatId , receiverId: myId }
        ]
      });

      // 3
      res.status(200).json(messages);
    } catch (error) {
        console.log('Error in getMessages: ', error.message)
        res.status(500).json({ message: 'Internal Server Error in getMessages' });
    }
}



export async function sendMessage(req, res) {
    try {
      // 1
      const { text, image } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user._id;

      // 2
      let imageUrl;
      if (image) {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }

      // 3
      const newMessage = new Message({
        senderId, receiverId, text, image: imageUrl
      });
      await newMessage.save();

      // 4
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', newMessage);
      }

      // 5
      res.status(200).json(newMessage);
    } catch (error) {
        console.log('Error in sendMessage: ', error.message)
    }
}
