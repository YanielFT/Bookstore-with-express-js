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
  req.user
    .createProduct({
      title,
      price,
      description,
      imageUrl,
    })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
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

  // const product = await Product.findByPk(productId);
  const product = await req.user.getProducts({ where: { id: productId } });
  if (!product) {
    return res.redirect("/");
  }
  res.render("admin/edit-product", {
    pageTitle: "New Product",
    path: "/admin/add-product",
    editing: edit,
    product: product[0],
  });
};

exports.postEditProducts = async (req, res, next) => {
  const { title, price, description, imageUrl } = req.body;
  const id = req.params.productId;
  const product = await Product.findByPk(id);
  if (product) {
    product.title = title;
    product.imageUrl = imageUrl;
    product.description = description;
    product.price = price;
    product.save();
  }

  res.redirect("/admin/products");
};

exports.getProducts = async (req, res, next) => {
  // const products = await Product.findAll();
  const products = await req.user.getProducts();
  res.render("admin/products", {
    path: "/admin/products",
    pageTitle: "Admin Products",
    prods: products,
  });
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const product = await Product.findByPk(productId);
  if (product) {
    await product.destroy();
  }
  res.redirect("/admin/products");
};
