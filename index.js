const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DV_PASS}@cluster0.8kdu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    // server to mongodb
   const database = client.db('playerDB');
   const playerCollection = database.collection('players')

   // read all player
   app.get('/players', async(req, res) => {
    const cursor = playerCollection.find();
    const result = await cursor.toArray();
    res.send(result)
   })
   
   // read specific player
   app.get('/players/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const player = await playerCollection.findOne(query);
    res.send(player);
   })


    // create player
    app.post('/players', async(req, res) => {
        const player = req.body;
        console.log('new player', player)
        const result = await playerCollection.insertOne(player);
        res.send(result)
    })

    // update player
    app.put('/players/:id', async(req, res) => {
        const id = req.params.id;
        const player = req.body;

        const filter = { _id: new ObjectId(id)};
        const options = { upsert: true};
        const updatedPlayer = {
            $set: {
                role: player.role,
                name: player.name,
                photo: player.photo
            }
        }

        const result = await playerCollection.updateOne(filter, updatedPlayer, options);
        res.send(result);
    })

    // delete player
    app.delete('/players/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)};
        const result = await playerCollection.deleteOne(query);
        res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Simple player server is running........')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})