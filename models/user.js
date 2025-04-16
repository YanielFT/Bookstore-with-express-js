const { ObjectId } = require("mongodb");
const { getDb } = require("../util/database");

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  static findById(userId) {
    const db = getDb();
    return db.collection("users").findOne({ _id: new ObjectId(userId) });
  }

  addToCart(product) {
    const db = getDb();
    console.log({ product });

    const cartProductIndex = this.cart?.items.findIndex(
      (p) => p.productId.toString() == product._id.toString()
    );

    let newQuantity = 1;
    const updatedCartItems = [...(this.cart?.items || [])];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex] = {
        ...updatedCartItems[cartProductIndex],
        quantity: newQuantity,
      };
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };

    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  async getCart() {
    const db = getDb();
    const productsIds = this.cart?.items.map((i) => i.productId);
    const products = await db
      .collection("products")
      .find({ _id: { $in: productsIds } })
      .toArray();
    return products.map((p) => ({
      ...p,
      quantity: this.cart.items.find(
        (c) => (productCart) =>
          p._id.toString() == productCart.productId.toString()
      ).quantity,
    }));
  }

  deleteCartItem(cartItemId) {
    const db = getDb();
    const updatedCart = this.cart?.items.filter(
      (i) => i.productId.toString() !== cartItemId.toString()
    );

    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCart } } }
      );
  }

  async addOrder() {
    const db = getDb();
    const productsCart = await this.getCart();
    const result = await db.collection("orders").insertOne({
      user: {
        _id: new ObjectId(this._id),
        name: this.username,
      },
      items: productsCart,
    });
    this.cart = [];
    db.collection("users").updateOne(
      { _id: new ObjectId(this._id) },
      { $set: { cart: { items: [] } } }
    );

    return result;
  }

  getOrders() {
    const db = getDb();
    return db.collection("orders").find({ "user._id": this._id }).toArray();
  }
}

module.exports = User;
