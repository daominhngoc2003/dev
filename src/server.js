import express from "express";
import cors from "cors";
import connectDB from "./configs/connectDB.js";
import productRouter from "./routes/Product.js";
import roleRouter from "./routes/Role.js";
import userRouter from "./routes/User.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//connect to Mongo DB
connectDB(process.env.MONGO_URL);

app.use("/api", productRouter);
app.use("/api", roleRouter);
app.use("/api", userRouter);

const PORT = process.env.PORT_SERVER || 8000;
app.listen(process.env.PORT_SERVER, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
