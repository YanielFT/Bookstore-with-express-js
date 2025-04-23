const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { check, body } = require("express-validator");

router.get("/add-product", isAuth, adminController.getAddProduct);
router.get("/products", isAuth, adminController.getProducts);
router.post(
  "/add-product",
  isAuth,
  [
    check("title").isLength({ max: 12, min: 2 }).trim(),
    check("imageUrl")
      .isLength({ min: 2 })
      .custom((value) => {
        const isUrl = /^(https?:\/\/[^\s]+)$/.test(value); // Valida si es una URL
        const isBase64 = /^data:image\/[a-zA-Z]+;base64,/.test(value); // Valida si es Base64
        if (!isUrl && !isBase64) {
          throw new Error(
            "El campo debe ser una URL válida o una cadena Base64"
          );
        }
        return true;
      })
      .trim(),
    check("price")
      .isNumeric()
      .custom((value) => {
        if (value > 0) return true;
        throw new Error("The price must be greater than zero");
      }),
    check("description").isLength({ min: 2 }).trim(),
  ],
  adminController.postAddProduct
);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post(
  "/edit-product/:productId",
  isAuth,
  [
    check("title").isLength({ max: 12, min: 2 }).trim(),
    check("imageUrl")
      .isLength({ min: 2 })
      .custom((value) => {
        const isUrl = /^(https?:\/\/[^\s]+)$/.test(value); // Valida si es una URL
        const isBase64 = /^data:image\/[a-zA-Z]+;base64,/.test(value); // Valida si es Base64
        if (!isUrl && !isBase64) {
          throw new Error(
            "El campo debe ser una URL válida o una cadena Base64"
          );
        }
        return true;
      })
      .trim(),
    check("price")
      .isNumeric()
      .custom((value) => {
        if (value > 0) return true;
        throw new Error("The price must be greater than zero");
      }),
    check("description").isLength({ min: 2 }).trim(),
  ],
  adminController.postEditProducts
);
router.post(
  "/delete-product/:productId",
  isAuth,
  adminController.deleteProduct
);
module.exports = router;
