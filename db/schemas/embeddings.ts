import mongoose from "mongoose";

const EmbeddingsSchema = new mongoose.Schema(
  {
    filePath: String,
    fileContent: String,
    embedding: Array<number>,
  },
  { timestamps: true }
);

export default EmbeddingsSchema;
