const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = async (req, res, next) => {
  try {
    const data = await Product.findAll();

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
    const product = await Product.findByPk(prodId);
    console.log(product);

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
    const data = await Product.findAll();
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
  const cart = await req.user.getCart();
  const prod = await cart.getProducts({ where: { id: prodId } });
  console.log(prod);

  let newQuantity = 1;
  if (prod.length > 0) {
    const oldQuantity = prod[0].cartItem.quantity;
    newQuantity += oldQuantity;
    await cart.addProduct(prod, {
      through: { quantity: newQuantity },
    });
  }

  const oldProd = await Product.findByPk(prodId);

  if (oldProd) {
    await cart.addProduct(oldProd, {
      through: { quantity: newQuantity },
    });
  }
  res.redirect("/cart");
};

exports.postOrder = async (req, res, next) => {
  const cart = await req.user.getCart();
  const products = await cart.getProducts();
  const order = await req.user.createOrder();
  order.addProducts(
    products.map((product) => {
      product.orderItem = { quantity: product.cartItem.quantity };
      return product;
    })
  );
  await cart.setProducts(null);
  res.redirect("/orders");
};

exports.getOrders = async (req, res, next) => {
  const orders = await req.user.getOrders({ include: ["products"] });
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
  const { id, price } = req.body;
  const cart = await req.user.getCart();
  const [prod] = await cart.getProducts({ where: { id } });

  if (prod) {
    await prod.cartItem.destroy();
  }
  res.redirect("/cart");
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await req.user.getCart();
    const products = await cart.getProducts();

    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products || [],
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.redirect("/");
  }
};
