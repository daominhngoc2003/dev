import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    roleNumber: {
      type: Number,
      required: true,
      enum: [0, 1, 2], // enum: [0: "Ngưng hoạt động", 1:"Admin", 2: "Nhân viên""]
      default: 2,
    },
    users: [
      {
        userId: {
          type: String,
          ref: "User",
        },
      },
    ],
    status: {
      type: Number,
      enum: [0, 1], //[0: Ngưng hoạt động, 1: Hoạt động]
      default: 1,
    },
    description: String,
  },
  { versionKey: false, timestamps: true }
);
roleSchema.plugin(mongoosePaginate);
export default mongoose.model("Role", roleSchema);
