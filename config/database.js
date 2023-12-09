import mongoose from "mongoose";

const connectDB = async () => {
    try {
      const connect = await mongoose.connect(
        process.env.MONGO_URI,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          dbName: "Eduventure",
        }
      );
      console.log("Database is connected");
    } catch (error) {
      throw new Error("Internal Server Error",error);
    }
  };

export default connectDB;