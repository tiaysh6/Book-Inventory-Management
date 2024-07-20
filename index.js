const express = require('express');
const app = express();
const port = process.env.PORT || 5000
const cors = require('cors')

//middleware
app.use(cors());
app.use(express.json());


app.get('/', (req,res) => {
    res.send('Hello world')
})


//mongoDB config

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://lancer123:Getpost_98@apinew.sbxctpi.mongodb.net/?retryWrites=true&w=majority&appName=ApiNew";

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
    // Send a ping to confirm a successful connection

    //creating a collection....

    const bookCollections = client.db("BookInventory").collection("books");

    //inserting docs
    app.post("/upload-book", async(req,res) => {
        const data = req.body;
        const result = await bookCollections.insertOne(data);
        res.send(result);
    })

    //get all books from DB
    // app.get("/all-books", async(req,res) => {
    //     const books = bookCollections.find();
    //     const result = await books.toArray();
    //     res.send(result);
    // })

    //update book data
    app.patch("/book/:id", async(req,res) => {
        const id = req.params.id;
        const updateBookData = req.body;
        const filter = {_id: new ObjectId(id)};
        const updateDoc = {
            $set: {
                ...updateBookData
            },
        }
        const options = { upsert: true };
        //update 
        const result = await bookCollections.updateOne(filter,updateDoc, options);
        res.send(result);
    })

    //delete a book
    app.delete("/book/:id", async(req,res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const result = await bookCollections.deleteOne(filter);
        res.send(result);   
    })

    //find by specific category
    app.get("/all-books", async(req,res) => {
        let query = {};
        if(req.query?.category){
            query = {category: req.query.category};
        }
        const result = await bookCollections.find(query).toArray();
        res.send(result);
    })

    // to get single book data
    app.get("/book/:id", async(req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await bookCollections.findOne(filter);
      res.send(result);
    })

    app.get("/search", async(req, res) => {
      const key = req.query.key;
      const regex = new RegExp(key, 'i'); // 'i' makes the search case-insensitive
      const result = await bookCollections.find({ bookTitle: { $regex: regex } }).toArray();
      res.send(result);
      
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log(`App is running on ${port}`)
})