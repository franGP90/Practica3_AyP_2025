import express from "express";
import { connectMongoDB } from "./mongo";
import rutasAuth from "./routes/auth";
import router from "./routes/getters"
import dotenv from "dotenv";

dotenv.config();

connectMongoDB();

const app = express();
app.use(express.json());
app.use("api/auth/register", rutasAuth);
app.use("api/auth/login", rutasAuth);
app.use("api/products", rutasAuth);
app.use("/user", router);

app.listen(3000, () => console.log("El API se ha inicidado"));