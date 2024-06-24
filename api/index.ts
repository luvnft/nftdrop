import * as dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, json } from "express";
import cors from "cors";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createLogger, transports } from "winston";
import {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter,
} from "firebase-admin/firestore";
import { getWallet } from "./base";

var serviceAccount = require("./serviceAccountKey.json");

const logger = createLogger({
  level: "info",
  transports: [new transports.Console()],
});

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

const app = express();

app.use(cors());
app.use(json());

// Set the port from process.env.PORT or default to 3000

let port = process.env.PORT || 3000;
if (typeof port === "string") {
  port = parseInt(port);
}

// Create a new client

const firestore = getFirestore(firebaseApp);

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const mint = await firestore.doc("mints/1").get();
    if (!mint.exists) {
      logger.error("Can't get 'mints/1', stopping api");
      return;
    }
    logger.info("Successfully connected to firestore!", mint);

    async function verifyRequest(req: Request) {
      const token = req.headers.authorization;

      if (!token) {
        return undefined;
      }

      const decodedToken = await getAuth(firebaseApp).verifyIdToken(token);

      return decodedToken;
    }

    app.get("/project/:projectId", async (req: Request, res: Response) => {
      const projectId = req.params.projectId;

      if (!projectId) {
        res.status(400).send("projectId is required");
        return;
      }

      const project = await firestore.doc(`projects/${projectId}`).get();

      if (!project.exists) {
        res.status(404).send("Project not found");
        return;
      }

      res.send(project.data());
    });

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

      logger.info("minting project", projectId, "uid", decodedToken.uid);

      const result = await firestore.collection("mints").add({
        projectId: projectId,
        uid: decodedToken.uid,
        timestamp: new Date(),
      });

      logger.info("db result", result);

      const newMintId = result.id;

      res.status(200).send({ mintId: newMintId });
    });

    app.get("/mints", async (req: Request, res: Response) => {
      const decodedToken = await verifyRequest(req);
      if (!decodedToken) {
        res.status(401).send("Unauthorized");
        return;
      }
      const userMints = await firestore
        .collection("mints")
        .where("uid", "==", decodedToken.uid)
        .get();

      res.send({
        mints: userMints.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        }),
      });
    });

    app.get("/admin/wallet", async (req: Request, res: Response) => {
      console.log(getWallet());
      res.send("ok");
    });

    app.get("/", (_: Request, res: Response) => {
      res.send("Hello World!");
    });

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (e) {
    logger.error("Error", e);
    firestore.terminate();
  }
}
run().catch(console.dir);
