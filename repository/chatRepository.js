import Message from "../models/messageModal.js";

const messageRepository = {
    createMessage: async (sender, receiver, text) => {
      try {
        const newMessage = new Message({
          sender,
          receiver,
          text,
        });
        const savedMessage = await newMessage.save();
        return savedMessage;
      } catch (error) {
        throw error;
      }
    },

    getMessagesForUser: async (userId) => {
        try {
          const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }],
          }).populate('sender receiver');
          return messages;
        } catch (error) {
          throw error;
        }
      },

      findMessagesBetweenUsers: async (user1, user2) => {
        try {
          const messages = await Message.find({
            $or: [
              { sender: user1, receiver: user2 },
              { sender: user2, receiver: user1 },
            ],
          })
          .sort({ date: 1 }) 
          .limit(10);        
          
          return messages ? messages : []; 
        } catch (error) {
          throw error;
        }
      }
      
  };

export default messageRepository;