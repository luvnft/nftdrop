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

async function addProject(data: {
  title: any;
  from: any;
  description: any;
  image: any;
  nftLink: any;
}) {
  const { title, from, description, image, nftLink } = data;
  return firestore.collection("projects").add({
    title,
    from,
    description,
    image,
    nftLink,
  });
}

async function getUserMint(projectId: any, uid: any) {
  const mint = await firestore
    .collection("mints")
    .where("projectId", "==", projectId)
    .where("uid", "==", uid)
    .limit(1)
    .get();

  if (mint.empty) {
    return undefined;
  }

  return mint.docs[0].data();
}

async function getProjectMintCount(projectId: any) {
  const result = await firestore
    .collection("mints")
    .where("projectId", "==", projectId)
    .count()
    .get();

  return result.data();
}

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
      try {
        const token = req.headers.authorization;

        if (!token) {
          return undefined;
        }

        const decodedToken = await getAuth(firebaseApp).verifyIdToken(token);

        return decodedToken;
      } catch (e) {
        logger.error("Error verifying token", e, req.headers.authorization);
        return undefined;
      }
    }

    // Unprotected routes

    app.get("/", (_: Request, res: Response) => {
      res.send("Hello World!");
    });

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

    app.get("/admin/wallet", async (req: Request, res: Response) => {
      logger.info(getWallet());

      res.send("ok");
    });

    // Protected routes

    app.post("/user/wallet", async (req: Request, res: Response) => {
      const decodedToken = await verifyRequest(req);
      if (!decodedToken) {
        res.status(401).send("Unauthorized");
        return;
      }

      const primaryEthereumWallet = req.body.primaryEthereumWallet;

      if (!primaryEthereumWallet) {
        res.status(400).send("primaryEthereumWallet is required");
        return;
      }

      try {
        await firestore.doc(`users/${decodedToken.uid}`).set({
          primaryEthereumWallet,
        });
      } catch (e) {
        logger.error(e);
      }

      res.send("ok");
    });

    app.get(
      "/project/:projectId/canMint",
      async (req: Request, res: Response) => {
        const decodedToken = await verifyRequest(req);
        if (!decodedToken) {
          res.status(401).send("Unauthorized");
          return;
        }

        const projectId = req.params.projectId;

        if (!projectId) {
          res.status(400).send("projectId is required");
          return;
        }

        const user = await firestore.doc(`users/${decodedToken.uid}`).get();

        const primaryEthereumWallet = user?.data()?.primaryEthereumWallet;

        const userMint = await getUserMint(projectId, decodedToken.uid);

        if (!userMint) {
          return res.send({ userAlreadyMinted: false, primaryEthereumWallet });
        }

        res.send({
          userAlreadyMinted: true,
          mintedOn: userMint.timestamp.toDate(),
          primaryEthereumWallet,
        });
      }
    );

    app.post("/mint", async (req: Request, res: Response) => {
      const decodedToken = await verifyRequest(req);
      if (!decodedToken) {
        res.status(401).send("Unauthorized");
        return;
      }

      if (await getUserMint(req.body.projectId, decodedToken.uid)) {
        res.status(400).send("User already minted");
        return;
      }

      const projectId = req.body.projectId;

      if (!projectId) {
        res.status(400).send("projectId is required");
        return;
      }

      const project = (
        await firestore.doc(`projects/${projectId}`).get()
      ).data();

      if (!project) {
        res.status(404).send("Project not found");
        return;
      }

      logger.info("minting project", projectId, "uid", decodedToken.uid);

      const result = await firestore.collection("mints").add({
        projectId: projectId,
        uid: decodedToken.uid,
        from: project?.from,
        title: project?.title,
        description: project?.description,
        image: project?.image,
        nftLink: project?.nftLink,
        timestamp: new Date(),
      });

      const newMintId = result.id;

      const mintCount = (await getProjectMintCount(projectId)).count;

      await firestore.doc(`projects/${projectId}`).update({
        mintCount,
      });

      res.status(200).send({ mintId: newMintId, mintCount });
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
      const data = userMints.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      console.log("sending mints", data);
      res.send(data);
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
