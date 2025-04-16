const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "New Product",
    path: "/admin/add-product",
    editing: false,
  });
};
exports.postAddProduct = async (req, res, next) => {
  const { title, price, description, imageUrl } = req.body;
  const { _id: userId } = req.user;
  const prod = new Product(title, price, description, imageUrl, null, userId);
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

  const product = await Product.fetchById(productId);
  if (!product) {
    return res.redirect("/");
  }
  res.render("admin/edit-product", {
    pageTitle: "New Product",
    path: "/admin/add-product",
    editing: edit,
    product: product,
  });
};

exports.postEditProducts = async (req, res, next) => {
  const { title, price, description, imageUrl } = req.body;
  const id = req.params.productId;
  const product = await Product.fetchById(id);
  if (product) {
    const newProd = new Product(title, price, description, imageUrl, id);
    await newProd.save();
  }

  res.redirect("/admin/products");
};

exports.getProducts = async (req, res, next) => {
  const products = await Product.fetchAll();
  res.render("admin/products", {
    path: "/admin/products",
    pageTitle: "Admin Products",
    prods: products,
  });
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  Product.deleteProduct(productId);
  res.redirect("/admin/products");
};
