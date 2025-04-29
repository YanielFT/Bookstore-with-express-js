const Order = require("../models/order");
const Product = require("../models/product");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const ITEMS_PER_PAGE = 2;

exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;
  const totalProducts = await Product.find().countDocuments();
  try {
    const data = await Product.find({})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render("shop/product-list", {
      path: "/products",
      pageTitle: "All 0",
      prods: data,
      totalProducts,
      hasNextpage: ITEMS_PER_PAGE * page < totalProducts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      currentPage: page,
      lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
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
  const page = +req.query.page || 1;
  const totalProducts = await Product.find().countDocuments();

  try {
    const data = await Product.find({})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("shop/index", {
      path: "/shop",
      pageTitle: "Shop",
      prods: data,
      totalProducts,
      hasNextpage: ITEMS_PER_PAGE * page < totalProducts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      currentPage: page,
      lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
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

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.user._id;
  const order = await Order.findById(orderId);
  console.log({ order });

  if (!order) return next(new Error("No order found."));
  if (order.user.userId.toString() !== userId.toString())
    return next(new Error("Unauthorized."));

  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);

  const pdfDoc = new PDFDocument();
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);

  pdfDoc.fontSize(26).text("Invoice");
  pdfDoc.text("---------------------------------------");

  let totalPrice = 0;
  order.products.forEach((p) => {
    totalPrice += p.product.price * p.quantity;
    pdfDoc
      .fontSize(12)
      .text(
        p.product.title + " - " + p.quantity + " X " + " $ " + p.product.price
      );
  });
  pdfDoc.text("---------------------------------------");
  pdfDoc.fontSize(26).text("Total Price - $" + totalPrice);
  pdfDoc.end();
  // fs.readFile(invoicePath, (err, data) => {
  //   if (err) {
  //     return next(err);
  //   }
  //   res.setHeader("Content-Type", "application/pdf");
  //   res.setHeader(
  //     "Content-Disposition",
  //     'inline; filename="' + invoiceName + '"'
  //   );
  //   res.send(data);
  // });

  // const file = fs.createWriteStream(invoicePath);
  // res.setHeader("Content-Type", "application/pdf");
};
