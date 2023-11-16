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
          $or: [
            { sender: userId},
            { receiver: userId },
          ],
        })
        return messages ? messages : []; 
      } catch (error) {
        console.error('Error in getMessagesForUser:', error);
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
          .sort({ date: -1 }) 
          .limit(10);        
          
          return messages ? messages.reverse() : []; 
        } catch (error) {
          throw error;
        }
      },

      findUnreadMessagesById: async (userId) => {
        try {

          const unreadMessagesCount = await Message.countDocuments({
            $or: [
              { receiver: userId, read: false },
            ],
          });
          
          return unreadMessagesCount ;
          
        } catch (error) {
          
        }
      },

      updateReadTrueForReciever: async (user,sender) => {
        try {
          const result = await Message.updateMany(
              { sender: sender, receiver: user, read: false },
              { $set: { read: true } },
              { multi: true },
            )
            return result
        } catch (error) {
          console.error('Error updating messages as read:', error);
          throw error; 
        }
      },

      findUnreadMessagesBetweenUsers: async (user1, user2) => {
        try {

          const unreadMessagesCount = await Message.aggregate([
            {
              $match: {
                sender: user2,
                receiver: user1,
                read: false,
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                count: 1,
              },
            },
          ]);
    
          return unreadMessagesCount.length > 0 ? unreadMessagesCount[0].count : 0;
    
        } catch (error) {
          console.error('Error finding unread messages between users:', error);
          throw error;
        }
      },
      

  };

export default messageRepository;