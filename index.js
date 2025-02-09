const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  Timestamp,
} = require("mongodb");

app.use(express.json());

const corsOption = {
  origin: ["http://localhost:5173", "https://shahbaz-kamal-dev.netlify.app"],
  Credentials: true,
};
app.use(cors(corsOption));

app.get("/", (req, res) => {
  res.send("My developer portfolio is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jxshq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //? starts here

    const projectCollections = client
      .db("web-developer-portfolio-db")
      .collection("project-collections");
    const messageCollection = client
      .db("web-developer-portfolio-db")
      .collection("messages");

    //   *geting data from database and show it to the server side

    app.get("/all-projects", async (req, res) => {
      const result = await projectCollections
        .find()
        .sort({ publicationDate: -1 })
        .toArray();
      res.send(result);
    });

    // *getting data from front end and sending to the server

    app.post("/add-project", async (req, res) => {
      const newProjectData = req.body;
      const result = await projectCollections.insertOne(newProjectData);
      res.send(result);
    });
    // *getting spesific id from client side and createing api for a spesific project for view details
    app.get("/view-details/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await projectCollections.findOne(query);
      res.send(result);
    });
    // *message section
    app.get("/messages", async (req, res) => {
      const result = await messageCollection
        .find()
        .sort({ timeStamp: -1 })
        .toArray();
      res.send(result);
    });

    app.post("/messages", async (req, res) => {
      const data = req.body;
      const newMessage = { ...data, timeStamp: new Date(), isRead: false };
      const result = await messageCollection.insertOne(newMessage);
      res.send(result);
    });

    app.patch("/message/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          isRead: true,
        },
      };
      const result = await messageCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Portfolio server is running on port ${port}`);
});
