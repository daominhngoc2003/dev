import mongoose from "mongoose";
const { Schema } = mongoose;
import mongoosePaginate from "mongoose-paginate-v2";

const ProductSchema = new Schema(
  {
    name: String,
    orderIds: [
      {
        orderId: {
          type: String,
          ref: "Order",
        },
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

ProductSchema.plugin(mongoosePaginate);

export default mongoose.model("Product", ProductSchema);
