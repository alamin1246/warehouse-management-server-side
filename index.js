const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.vmphq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        console.log('database connected successfully');

        const productCollection = client.db("kidsToysStock").collection("products");

        app.post("/uploadPd", async (req, res) => {
            const product = req.body;
            // console.log(product);
            const result = await productCollection.insertOne(product);
            res.send({ success: 'Product Upload Successfully' })
        });

        // products api
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        // POST
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        /*   // DELETE
          app.delete('/product/:id', async (req, res) => {
              const id = req.params.id;
              const query = { _id: ObjectId(id) };
              const result = await productCollection.deleteOne(query);
              res.send(result);
          });
   */
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Successfully running Kids Toys Stock Management');
});
app.listen(port, () => {
    console.log('Listen server Running on port', port);
})