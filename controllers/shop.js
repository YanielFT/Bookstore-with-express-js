const Order = require("../models/order");
const Product = require("../models/product");

exports.getProducts = async (req, res, next) => {
  try {
    const data = await Product.find({});

    res.render("shop/product-list", {
      path: "/products",
      pageTitle: "All 0",
      prods: data,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);

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
    const data = await Product.find({});
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
  const product = await Product.findById(prodId);
  if (product) await req.user.addToCart(product);

  res.redirect("/cart");
};

exports.postOrder = async (req, res, next) => {
  await req.user.addOrder();
  res.redirect("/orders");
};

exports.getOrders = async (req, res, next) => {
  const orders = await Order.getOrders(req.user._id);
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

  await req.user.deleteCartItem(productId);

  res.redirect("/cart");
};

exports.getCart = async (req, res, next) => {
  try {
    const { cart } = await req.user.populate("cart.items.productId");

    const items = cart?.items.map((item) => ({
      ...item.productId._doc,
      quantity: item.quantity,
    }));

    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: items ?? [],
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.redirect("/");
  }
};
