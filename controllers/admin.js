const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");
exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }

  res.render("admin/edit-product", {
    pageTitle: "New Product",
    path: "/admin/add-product",
    editing: false,
    oldInput: { title: "", price: "", description: "", imageUrl: "" },
    errorMessage: req.flash("error"),
  });
};

exports.postAddProduct = async (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "New Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: [{ msg: "Attached file is not an image" }],
      oldInput: { title, price, description, image },
    });
  }

  const imageUrl = image.path;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "New Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errors.array(),
      oldInput: { title, price, description, imageUrl },
    });
  }

  try {
    const prod = new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.user,
    });
    await prod.save();
  } catch (error) {
    console.log(error);
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
  res.redirect("/");
};

exports.getEditProduct = async (req, res, next) => {
  const edit = req.query.edit === "true";
  if (!edit) {
    return res.redirect("/");
  }
  const productId = req.params.productId;
  if (!productId) {
    return res.redirect("/");
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "New Product",
      path: "/admin/add-product",
      editing: edit,
      oldInput: product,
      errorMessage: req.flash("error"),
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.postEditProducts = async (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  const id = req.params.productId;
  try {
    const product = await Product.findById(id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "New Product",
        path: "/admin/add-product",
        editing: true,
        errorMessage: errors.array(),
        oldInput: { _id: id, title, price, description, image: undefined },
      });
    }

    if (product) {
      let imageUrl = product.imageUrl;
      if (image?.path) {
        fileHelper.deleteFile(imageUrl);
        imageUrl = image.path;
      }

      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      await product.updateOne({ title, price, description, imageUrl });
    }

    res.redirect("/admin/products");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  const products = await Product.find({ userId: req.user._id });
  // .select("title price imageUrl -_id")
  // .populate("userId", "name");
  res.render("admin/products", {
    path: "/admin/products",
    pageTitle: "Admin Products",
    prods: products,
  });
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const existProd = await Product.findById(productId);
    if (!existProd) {
      return next(new Error("Product not found"));
    }

    fileHelper.deleteFile(existProd.imageUrl);
    
    await Product.deleteOne({
      _id: productId,
      userId: req.user._id,
    });
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    res.status(500).json({ message: "Deleting product failed" });
  }
};
