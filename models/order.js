const { getDb } = require("../util/database");

class Order {
  constructor(id, items) {
    this._id = id;
    this.items = items;
  }

  fetchAll() {
    const db = getDb();
    return db.collection("orders").find().toArray();
  }
}

module.exports = CartItem;
