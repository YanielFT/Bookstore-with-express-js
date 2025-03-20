const fs = require("fs");
const path = require("path");
const Cart = require("./cart");

const p = path.join(
  path.dirname(require.main.filename),
  "data",
  "products.json"
);

const getProductsFromFile = (cb) => {
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

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }
  save() {
    getProductsFromFile((products) => {
      console.log(this.id);
      
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (p) => this.id === p.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), (error) => {
          console.log(error);
        });
      } else {        
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (error) => {
          console.log(error);
        });
      }
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  
  static deleteProduct(id) {
    getProductsFromFile(products => {
      const productIndex = products.findIndex((p) => p.id === this.id);
      products = products.filter(p => p.id !== id)
      fs.writeFile(p, JSON.stringify(products), (error) => {
        if(!error){
          Cart.deleteProduct(id);
        }
      });
    })
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((prod) => prod.id === id);
      cb(product);
    });
  }
};

