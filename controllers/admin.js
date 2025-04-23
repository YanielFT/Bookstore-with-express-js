const Product = require("../models/product");
const { validationResult } = require("express-validator");

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
  const { title, price, description, imageUrl } = req.body;
  const errors = validationResult(req);
  console.log({ errors: errors.array() });

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "New Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errors.array(),
      oldInput: { title, price, description, imageUrl },
    });
  }

  const prod = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user,
  });
  await prod.save();
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
};

exports.postEditProducts = async (req, res, next) => {
  const { title, price, description, imageUrl } = req.body;
  const id = req.params.productId;
  const product = await Product.findById(id);
  const errors = validationResult(req);
  console.log({ errors: errors.array() });

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "New Product",
      path: "/admin/add-product",
      editing: true,
      errorMessage: errors.array(),
      oldInput: { _id: id, title, price, description, imageUrl },
    });
  }

  if (product) {
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    await product.updateOne({ title, price, description, imageUrl });
  }

  res.redirect("/admin/products");
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
  await Product.deleteOne({
    _id: productId,
    userId: req.user._id,
  });

  res.redirect("/admin/products");
};
