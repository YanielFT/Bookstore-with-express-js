const mongoose = require("mongoose");
const Product = require("./product");
const Order = require("./order");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items?.findIndex(
    (p) => p.productId.toString() == product._id.toString()
  );

  console.log({ cartProductIndex });

  let newQuantity = 1;
  const updatedCartItems = [...(this.cart?.items || [])];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex] = {
      ...updatedCartItems[cartProductIndex]._doc,
      quantity: newQuantity,
    };
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  console.log({ updatedCartItems });

  const updatedCart = {
    items: updatedCartItems,
  };
  console.log(updatedCart);

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.getCart = async function () {
  const productsIds = await this.cart.items.map((i) => i.productId);
  console.log({ productsIds });

  const products = await Product.find({ _id: { $in: productsIds } });
  console.log({ products });

  return products.map((item) => ({
    ...item._doc,
    quantity: this.cart.items.find(
      (i) => i.productId.toString() == item._id.toString()
    ).quantity,
  }));
};

userSchema.methods.deleteCartItem = function (productId) {
  console.log(this.cart.items);
  console.log(productId);

  const updatedCartItems = this.cart.items.find(
    (item) => item.productId.toString() != productId.toString()
  );
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.addOrder = async function () {
  const { cart: populatedCart } = await this.populate("cart.items.productId");

  const products = populatedCart.items.map((item) => {
    return {
      product: { ...item.productId },
      quantity: item.quantity,
    };
  });

  const newOrder = {
    products,
    user: {
      email: this.email,
      userId: this._id,
    },
  };
  console.log({ newOrder });

  Order.create(newOrder);
  this.cart.items = [];
  this.save();
};

module.exports = mongoose.model("User", userSchema);
