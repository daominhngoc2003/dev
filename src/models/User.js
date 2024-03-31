import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const userSchema = new mongoose.Schema(
  {
    fullname: String,
    username: String,
    password: String,
    phone: String,
    avatar: {
      type: String,
      default: "aaa.jpg",
    },
    roleId: {
      type: String,
      ref: "Role",
    },
    roleNumber: {
      type: Number,
      default: 2,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.plugin(mongoosePaginate);
export default mongoose.model("User", userSchema);
