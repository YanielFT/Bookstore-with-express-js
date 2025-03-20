const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "New Product",
    path: "/admin/add-product",
    editing: false,
  });
};
exports.postAddProduct = (req, res, next) => {
  const { title, price, description, imageUrl } = req.body;
  const product = new Product(null, title, imageUrl, description, price);
  product.save();
  res.redirect("/");
};

exports.getEditProduct = (req, res, next) => {
  const edit = req.query.edit === "true";
  if (!edit) {
    return res.redirect("/");
  }
  const productId = req.params.productId;
  if (!productId) {
    return res.redirect("/");
  }

  Product.findById(productId, (p) => {
    res.render("admin/edit-product", {
      pageTitle: "New Product",
      path: "/admin/add-product",
      editing: edit,
      product: p,
    });
  });
};

exports.postEditProducts = (req, res, next) => {
  const { title, price, description, imageUrl } = req.body;
  const id = req.params.productId;
  const product = new Product(id, title, imageUrl, description, price);
  product.save();
  res.redirect("/admin/products");
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("admin/products", {
      path: "/admin/products",
      pageTitle: "Admin Products",
      prods: products,
    });
  });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.deleteProduct(productId);
  res.redirect("/admin/products");
};
