import { Router } from "express";
import {
  createRole,
  deleteRole,
  getAllRole,
  getOneRole,
  updateRole,
} from "../controllers/Role.js";
import authenticate from "../middlewares/authenticate.js";
import { adminAuth, generalAuth } from "../middlewares/authorization.js";
const router = Router();
router
  .get("/role", authenticate, generalAuth, getAllRole)
  .get("/role/:id", authenticate, generalAuth, getOneRole)
  .post("/role", authenticate, adminAuth, createRole)
  .put("/role/:id", authenticate, adminAuth, updateRole)
  .delete("/role/:id", authenticate, adminAuth, deleteRole);
export default router;
