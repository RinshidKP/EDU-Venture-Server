import express, { json } from 'express';
import {createMessage,findMessagesBetweenUsers,getMessagesForUser} from "../controllers/chatController/chatController.js";
import { userSockets } from '../server.mjs';
import { verify } from '../middleware/auth.js';
import uploadChatFile from '../helper/uploadChatFiles.js';

const router = express.Router();

router.post('/messages', async (req, res) => {
  const { sender, receiver, text ,type } = req.body; 
  try {
    const message = await createMessage(sender, receiver, text ,type);
    if(userSockets[receiver]){
        const socket = userSockets[receiver];
        console.log(message);
        socket.emit('message',{message})
    }
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error creating message' });
  }
});

router.post('/uploadfiles', (req, res) => {
  try {    
    uploadChatFile(req, res, err => {
      if (err) {
        console.error('Upload error:', err);
        return res.json({ success: false, err });
      }
      console.log(req.file);
      return res.json({ success: true, url: res.req.file.filename });
    });
  } catch (error) {
    console.error('Error:', error);
    res.json({ success: false, error });
  }
});


// Fetch messages for a user
router.get('/messages/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const messages = await getMessagesForUser(userId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Find messages between two users
router.get('/messages/:user1/:user2', async (req, res) => {
  const user1 = req.params.user1;
  const user2 = req.params.user2;
  try {
    const messages = await findMessagesBetweenUsers(user1, user2);
    if(!messages){
       return res.status(400).json({message:'No message Found'})
    }
    // console.log(messages);
    res.status(200).json({messages});
  } catch (error) {
    res.status(500).json({ error: 'Error finding messages' });
  }
});

export default router;
