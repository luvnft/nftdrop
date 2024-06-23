import express, { Request, Response, json } from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import * as dotenv from "dotenv";
import cors from "cors";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

console.log("Starting server");

var serviceAccount = require("./serviceAccountKey.json");

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

dotenv.config();

const app = express();

app.use(cors());
app.use(json());

const port = Number(process.env.PORT) ?? 3000;

const uri = process.env.MONGO_CONNECTION_STRING;

if (!uri) {
  console.error("MONGO_CONNECTION_STRING missing");
  process.exit(1);
}

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const document = await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!", document);

    function getCollection(collectionName: string) {
      const db = client.db("nft-surprise");
      const collection = db.collection(collectionName);
      return collection;
    }

    const mintCount = await getCollection("mints").countDocuments();
    console.log("mint count", mintCount);

    async function verifyRequest(req: Request) {
      const token = req.headers.authorization;

      if (!token) {
        return undefined;
      }

      const decodedToken = await getAuth(firebaseApp).verifyIdToken(token);

      return decodedToken;
    }

    app.post("/mint", async (req: Request, res: Response) => {
      const decodedToken = await verifyRequest(req);
      if (!decodedToken) {
        res.status(401).send("Unauthorized");
        return;
      }

      const projectId = req.body.projectId;

      if (!projectId) {
        res.status(400).send("projectId is required");
        return;
      }

      console.log("minting project", projectId, "uid", decodedToken.uid);

      const result = await getCollection("mints").insertOne({
        projectId: projectId,
        uid: decodedToken.uid,
        timestamp: new Date(),
      });

      console.log("db result", result);

      const newMintId = result.insertedId;

      res.status(200).send({ mintId: newMintId });
    });

    app.get("/mints", async (req: Request, res: Response) => {
      const decodedToken = await verifyRequest(req);
      if (!decodedToken) {
        res.status(401).send("Unauthorized");
        return;
      }
      const userMints = await getCollection("mints")
        .find({ uid: decodedToken.uid })
        .toArray();
      res.send({ mints: userMints });
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (e) {
    console.error("Error", e);
    await client.close();
  }
}
run().catch(console.dir);
