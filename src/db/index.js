import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log(`${process.env.MongoDB_URI}/${process.env.DB_NAME}`);
    const connectionInstance = await mongoose.connect(
      `${process.env.MongoDB_URI}/${process.env.DB_NAME}`
    );
    console.log(
      `\n MongoDB connected ! DB host: ${connectionInstance.connection.host}`
    );
    console.log("Connection instance:", connectionInstance); //hw-> connectionInstance is the result of the mongoose.connect() method, which returns a Mongoose connection instance
    //contains properties and methods to interact with the database
  } catch (error) {
    console.log("MONGODB connection error: ", error);
    process.exit(1); //The process.exit(1) line is typically used to stop the execution of the program in case the database connection fails.
  }
};

export default connectDB;
