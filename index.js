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