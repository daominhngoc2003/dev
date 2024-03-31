import { Router } from "express";
import { createProduct } from "../controllers/Product.js";
const router = Router();
router.post("/product", createProduct);
export default router;
