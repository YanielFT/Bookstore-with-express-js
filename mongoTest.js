const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

// Conexión a la base de datos
const mongoConnect = async () => {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017", { useUnifiedTopology: true });
    console.log("Conexión exitosa a MongoDB");

    // Seleccionar la base de datos
    const db = client.db("bookstore");

    // Seleccionar una colección
    const collection = db.collection("users");

    // Insertar un documento
    const insertResult = await collection.insertOne({ name: "Juan", email: "juan@example.com", age: 25 });
    console.log("Documento insertado:", insertResult.ops);

    // Leer documentos
    const users = await collection.find().toArray();
    console.log("Documentos encontrados:", users);

    // Actualizar un documento
    const updateResult = await collection.updateOne({ name: "Juan" }, { $set: { age: 30 } });
    console.log("Documento actualizado:", updateResult.modifiedCount);

    // Eliminar un documento
    const deleteResult = await collection.deleteOne({ name: "Juan" });
    console.log("Documento eliminado:", deleteResult.deletedCount);

    // Cierra la conexión
    client.close();
    console.log("Conexión cerrada");
  } catch (err) {
    console.error("Error al conectar o realizar operaciones en MongoDB:", err);
  }
};

// Ejecutar la función
mongoConnect();