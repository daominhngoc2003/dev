import { Router } from "express";
import {
  changePassword,
  createUser,
  deleteUser,
  getAllUser,
  getOneUser,
  signIn,
  updateUser,
} from "../controllers/User.js";
import authenticate from "../middlewares/authenticate.js";
import { adminAuth, generalAuth } from "../middlewares/authorization.js";
const router = Router();
router
  .get("/user", authenticate, generalAuth, getAllUser)
  .get("/user/:id", authenticate, generalAuth, getOneUser)
  .put("/user/:id", authenticate, generalAuth, updateUser)
  .put("/changePassword", authenticate, generalAuth, changePassword)
  .post("/user", authenticate, adminAuth, createUser)
  .delete("/user/:id", authenticate, adminAuth, deleteUser)
  .post("/signin", signIn);

export default router;
