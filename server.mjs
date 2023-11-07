import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js'
import cors from 'cors';
import cookieParser from "cookie-parser";
import http from 'http';
import { Server } from 'socket.io';

import studentRoutes from './routes/studentRoutes.js';
import consultentRoutes from './routes/consultentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server,{ 
  transports: ['websocket'], 
cors: {
  origin: '*', // Replace with your client's origin
  methods: ['GET', 'POST'],
  },
})

export const userSockets = {}

app.use(cookieParser());
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

connectDB();

app.use('/', studentRoutes);
app.use('/consultent', consultentRoutes);
app.use('/admin', adminRoutes);
app.use('/chat', chatRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

function getUserIdFromSocket(socket) {
  const userId = socket.handshake.query.userId;

  return userId ;
}

io.on('connection', (socket) => {
  console.log('A user connected');
  const userId = getUserIdFromSocket(socket)
  if(userId){
    userSockets[userId]=socket;
    console.log('user',userId); 
  }
  socket.on('disconnect', () => {

    delete userSockets[userId];
  });
  
  
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
