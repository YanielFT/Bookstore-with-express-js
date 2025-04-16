const Product = require("../models/product");
// const Cart = require("../models/cart");

exports.getProducts = async (req, res, next) => {
  try {
    const data = await Product.fetchAll();

    res.render("shop/product-list", {
      path: "/products",
      pageTitle: "All products",
      prods: data,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.fetchById(prodId);

    if (product)
      res.render("shop/product-detail", {
        pageTitle: "Product detail",
        path: "/product-detail",
        product,
      });
    else res.redirect("/products");
  } catch (error) {
    console.log(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const data = await Product.fetchAll();
    res.render("shop/index", {
      path: "/shop",
      pageTitle: "Shop",
      prods: data,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  const product = await Product.fetchById(prodId);

  await req.user.addToCart(product);

  res.redirect("/cart");
};

exports.postOrder = async (req, res, next) => {
  await req.user.addOrder();
  res.redirect("/orders");
};

exports.getOrders = async (req, res, next) => {
  const orders = await req.user.getOrders();
  console.log(orders);

  res.render("shop/order", {
    path: "/order",
    pageTitle: "Your Orders",
    orders,
  });
};

exports.getChechkout = (req, res, next) => {
  res.render("/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  console.log({ productId });

  await req.user.deleteCartItem(productId);

  res.redirect("/cart");
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await req.user.getCart();
    console.log({ cart });

    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: cart ?? [],
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.redirect("/");
  }
};
