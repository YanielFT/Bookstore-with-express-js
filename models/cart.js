const fs = require("fs");
const path = require("path");

const p = path.join(path.dirname(require.main.filename), "data", "cart.json");

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      const existingProductIndex = cart.products.findIndex((p) => p.id === id);
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty += 1;
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = +productPrice + +cart.totalPrice;
      fs.writeFile(p, JSON.stringify(cart), (error) => {
        console.log(error);
      });
    });
  }
  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      const productTodeleteIndex = cart.products.findIndex((p) => p.id === id);
      if (productTodeleteIndex != -1) {
        const qty = cart.products[productTodeleteIndex].qty;
        cart.totalPrice -= qty * productPrice;
        cart.products.filter((p) => p.id !== id);
      }
      fs.writeFile(p, JSON.stringify(cart), (error) => {
        console.log(error);
      });
    });
  }
  static deleteOneProduct(id, productPrice) {
    console.log({ id, productPrice });

    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }

      const productTodeleteIndex = cart.products.findIndex((p) => p.id === id);
      if (productTodeleteIndex != -1) {
        const qty = cart.products[productTodeleteIndex].qty;
        cart.totalPrice -= productPrice;
        if (qty === 1) cart.products = cart.products.filter((p) => p.id !== id);
        else cart.products[productTodeleteIndex].qty -= 1;
      }
      fs.writeFile(p, JSON.stringify(cart), (error) => {
        console.log(error);
      });
    });
  }
  static getCart = (cb) => {
    fs.readFile(p, (error, fileContent) => {
      if (error) {
        return cb([]);
      }

      try {
        cb(JSON.parse(fileContent));
      } catch (parseError) {
        return [];
      }
    });
  };
};
