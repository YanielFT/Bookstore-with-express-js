const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/product-list", {
      path: "/products",
      pageTitle: "All products",
      prods: products,
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  const resp = Product.findById(prodId, (product) => {
    res.render("shop/product-detail", {
      pageTitle: "Product detail",
      path: "/product-detail",
      product,
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/index", {
      path: "/shop",
      pageTitle: "Shop",
      prods: products,
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  const price = req.body.price;
  Cart.addProduct(prodId, price);
  res.redirect("/cart");
};

exports.getOrders = (req, res, next) => {
  res.render("shop/order", {
    path: "/order",
    pageTitle: "Your Orders",
  });
};

exports.getChechkout = (req, res, next) => {
  res.render("/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { id, price } = req.body;
  console.log(req.body);
  
  Cart.deleteOneProduct(id, price);
  res.redirect("/cart");
};



exports.getCart = (req, res, next) => {
  
  Cart.getCart((cart) => {
    Product.fetchAll((products) => {
      const cardProduct = [];
      for (const prod of products) {
        const cartData = cart.products.find(
          (productCart) => productCart.id === prod.id
        );
        if (cartData) {
          cardProduct.push({ productData: prod, qty: cartData.qty });
        }
      }
      
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cardProduct,
      });
    });
  });
};
