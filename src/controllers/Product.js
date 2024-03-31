import Product from "../models/product.js";

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (!product) {
      return res.json({
        message: "ERROR",
        status: 400,
      });
    }
    return res.json({
      message: "Create successful products",
      product,
      status: 200,
    });
  } catch (error) {
    console.error("Something went wrong: ", error.message);
  }
};
