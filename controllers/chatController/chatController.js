import messageRepository from "../../repository/chatRepository.js";

export const createMessage = async (sender, receiver, text) => {
    return messageRepository.createMessage(sender, receiver, text);
  };
  
 export  const getMessagesForUser = async (userId) => {
    return messageRepository.getMessagesForUser(userId);
  };
  
 export  const findMessagesBetweenUsers = async (user1, user2) => {
    const message = await  messageRepository.findMessagesBetweenUsers(user1, user2);
    return message
  };

