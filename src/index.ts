import express from "express";
import { connectMongoDB } from "./mongo";
import rutasAuth from "./routes/auth";
import router from "./routes/patatas"
import dotenv from "dotenv";

dotenv.config();

connectMongoDB();

const app = express();
app.use(express.json());
app.use("/auth", rutasAuth);
app.use("/patata", router);

app.listen(3000, () => console.log("El API ha comenzado baby"));