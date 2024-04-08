import mongoose from "mongoose";

const Schema = mongoose.Schema;

let postSchema = Schema({
  userId: mongoose.Types.ObjectId,
  text: String,
});

export default mongoose.model("Post", postSchema);
