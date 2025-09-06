import mongoose from "mongoose";
import "dotenv/config";

const connection = mongoose.createConnection(
  `mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@localhost:${process.env.MONGO_DB_PORT}`
);

export default connection;
