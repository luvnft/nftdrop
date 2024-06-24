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

      await addProject({
        title: "Sonic Memories: Live at Wembley",
        from: "RockLegends Productions",
        description:
          "Relive the electrifying moments of the unforgettable concert at Wembley Stadium. This exclusive NFT includes a unique digital artwork inspired by the event, along with access to behind-the-scenes footage and a downloadable audio track of the night's highlight performance.",
        image:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        nftLink:
          "https://opensea.io/assets/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/1234567890",
      });
      await addProject({
        title: "Harmony Fest 2023 VIP Pass",
        from: "Global Rhythm Events",
        description:
          "Your digital VIP pass to Harmony Fest 2023! This NFT grants you exclusive access to VIP areas, meet-and-greet opportunities with headlining artists, and a curated playlist of performances from the festival. Plus, unlock special AR features when you're on the festival grounds!",
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
        nftLink:
          "https://opensea.io/assets/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/9876543210",
      });
      await addProject({
        title: "Neon Nights: Club Euphoria Opening",
        from: "Metropolis Entertainment",
        description:
          "Commemorate the grand opening of Club Euphoria with this exclusive NFT. It features a dynamic, animated artwork that pulses to the rhythm of the club's signature track. Owners get priority entry to the club for a year and access to a secret menu of signature cocktails.",
        image:
          "https://images.unsplash.com/photo-1545128485-c400e7702796?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        nftLink:
          "https://opensea.io/assets/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/1357924680",
      });
      await addProject({
        title: "Digital Canvas: Abstract Reality",
        from: "Future Art Collective",
        description:
          "A digital representation of the centerpiece from our 'Abstract Reality' exhibition. This NFT transforms based on the time of day, mirroring the light conditions of the physical installation. Includes a virtual tour of the entire exhibition and an interview with the artist.",
        image:
          "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1115&q=80",
        nftLink:
          "https://opensea.io/assets/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/2468013579",
      });
      await addProject({
        title: "Culinary Quest: Gourmet Festival Pass",
        from: "Global Gastronomy Group",
        description:
          "Your ticket to a world of flavors! This NFT unlocks exclusive tastings at our annual Gourmet Festival. It also includes a digital cookbook featuring recipes from participating chefs, and transforms over time to reflect the dishes you've sampled at the event.",
        image:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        nftLink:
          "https://opensea.io/assets/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/3141592653",
      });
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
