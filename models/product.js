const { ObjectId } = require("mongodb");
const { getDb } = require("../util/database");

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id;
    this.userId = userId;
  }

  async save() {
    const db = getDb();
    let debOp;
    const { _id: id, ...otherData } = this;
    if (id) {
      debOp = db
        .collection("products")
        .updateOne({ _id: new ObjectId(id) }, { $set: otherData });
    } else {
      debOp = db.collection("products").insertOne(this);
    }
    return debOp
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  static fetchById(productId) {
    const db = getDb();
    console.log({ productId });

    return db
      .collection("products")
      .find({ _id: new ObjectId(productId) })
      .next()
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  static async deleteProduct(productId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new ObjectId(productId) })
  }
}

module.exports = Product;
