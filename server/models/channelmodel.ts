import * as mongoose from "mongoose";
import UserModel from "./usermodel";
import MessageModel from "./messagemodels";

const User = UserModel.schema;
const Message = MessageModel.schema;

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  owner: {
    type: String
  },
  members: {
    type: [User]
  },
  messages: {
    type: [Message]
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

const ChannelModel = mongoose.model("Channel", channelSchema);

export default ChannelModel;
