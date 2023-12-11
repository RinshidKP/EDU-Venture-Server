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

const corsOptions = {
  origin: [
    'eduventure-eight.vercel.app',
    'http://eduventure-eight.vercel.app',
    'https://eduventure-eight.vercel.app',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
};

const io = new Server(server,{ 
  transports: ['websocket'], 
cors: corsOptions
})

export const userSockets = {}

app.use(cookieParser());
dotenv.config();
app.use(cors(corsOptions));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended:true},{limit: '50mb'}));
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
  const userId = getUserIdFromSocket(socket)
  if(userId){
    userSockets[userId]=socket;
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