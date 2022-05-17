const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
// const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");
const jwt = require("jsonwebtoken");
const req = require("express/lib/request");
const res = require("express/lib/response");
require("dotenv").config();
// app
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized user" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden User" });
    } else {
      req.decoded = decoded;
      next();
    }
  });
};

// connect with mogodb

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.vmphq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const inventoryCollection = client
      .db("kidsToysStock")
      .collection("products");

    // get user access token
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    app.get("/inventory-items", async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventoryItems = await cursor.limit(6).toArray();

      res.send(inventoryItems);
    });
    app.get("/all-inventory-items", async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventoryItems = await cursor.toArray();

      res.send(inventoryItems);
    });
    app.get("/manage-inventory/", async (req, res) => {
      const id = req.params.id;
      const query = { _id: mongodb.ObjectId(id) };
      const cursor = inventoryCollection.find(query);
      const inventoryItems = await cursor.toArray();

      res.send(inventoryItems);
    });

    // Item Details Api
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: mongodb.ObjectId(id) };
      const result = await inventoryCollection.findOne(query);
      res.send(result);
    });

    // user items get api
    app.get("/my-items", verifyUser, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      const query = { email: email };

      if (email === decodedEmail) {
        const cursor = inventoryCollection.find(query);
        const myItems = await cursor.toArray();

        res.send(myItems);
      } else {
        return res.status(403).send({ message: "Forbidden User" });
      }
    });

    // POST New Item
    app.post("/new-inventory-item", async (req, res) => {
      const newItem = req.body;

      const result = await inventoryCollection.insertOne(newItem);
      res.send(result);
    });

    // update stock  quantity
    app.put("/inventory-items/:id", async (req, res) => {
      const id = req.params.id;
      const newQuantity = req.body;

      const filter = { _id: mongodb.ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: newQuantity.quantity,
        },
      };
      const result = await inventoryCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });

    // delete stock item
    app.delete("/inventory-items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: mongodb.ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/", async (req, res) => {
      res.send("Kids Toys Stock management server successfully Run");
    });
  } finally {
  }
};
run().catch(console.dir);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Listening Kids Toys Stock on port:", port));
