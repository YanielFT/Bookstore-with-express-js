const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = async (callback) => {
  const client = await MongoClient.connect("mongodb://localhost:27017");
  if (client) {
    console.log("connected");
    _db = client.db("bookstore");
    callback();
  }
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
