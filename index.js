const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const bodyParser = require("body-parser");
// for env variable//
require("dotenv").config();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//configure mongodb////////////////////

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.raiw9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

client.connect((err) => {
  const ridersCollection = client.db("hero-ride").collection("riders");
  const adminsCollection = client.db("hero-ride").collection("admins");
  console.log("Database connection established!");

  //creating API to add service from admin (Create) //
  app.post("/addRider", (req, res) => {
    const newRider = req.body;
    console.log("adding a new rider", newRider);
    ridersCollection.insertOne(newRider).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(result.insertedCount);
    });
  });

  //   // buy now onclick get SERVICE data//
  app.get("/rider/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    ridersCollection.find({ _id: id }).toArray((err, documents) => {
      console.log(documents);
      res.send(documents[0]); // must//
    });
  });

  //read data for showing all the created services to UI //optional
  app.get("/riders", (req, res) => {
    ridersCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  //delete rider by admin////////////
  app.delete("/deleteRider/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    console.log("deleting this", id);
    ridersCollection.deleteOne({ _id: id }).then((documents) => {
      res.send(documents.deletedCount > 0);
      console.log("deleted count", documents.deletedCount);
    });
  });

  //////////////////// MAKE ADMIN SECTION//////////////////////////////////
  app.post("/makeAdmin", (req, res) => {
    const email = req.body.email;
    console.log("adding new admin", email);
    //{email} because it's a part of the whole body//
    adminsCollection.insertOne({ email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // VIP Service only for admins :p //
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminsCollection.find({ email: email }).toArray((err, admins) => {
      console.log(admins);
      res.send(admins.length > 0);
    });
  });

  ///
});
