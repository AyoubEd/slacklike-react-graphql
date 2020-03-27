import * as mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  author: {
    type: String,
    required: true
  },
  body: {
    type: String,
    reuired: true
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
