import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: "lastname is required"
  },
  password: {
    type: String,
    required: "Password is required"
  },
  firstname: {
    type: String,
    required: "firstname is required"
  },
  lastname: {
    type: String,
    required: "lastname is required"
  },
  createdat: {
    type: Date,
    default: Date.now
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
