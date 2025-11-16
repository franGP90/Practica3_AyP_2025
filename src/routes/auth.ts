import { Router } from "express";
import { connectMongoDB, getDb } from "../mongo";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const router = Router();

dotenv.config();

const SECRET = process.env.SECRET;

type User = {
    _id?: ObjectId; //(auto‑generado)
    username: String, //único, requerido
    email: String,// único, requerido, formato email válido
    passwordHash: String,// (hash bcrypt)
    createdAt: Date //(default)
}

type Product = {
_id: ObjectId
name: String,// requerido
description: String,// opcional
price: Number,// requerido, >0
stock: Number, //requerido, >=0
createdAt: Date// (default)
}

type Carts = {
    _id: ObjectId
    userId: ObjectId //(referencia a users), único por usuario
    items: Product[] //{ productId, quantity }
}
const coleccion = () => getDb().collection<User>("User");

router.get("/", async (req, res)=>{
  res.send("Se ha conectado a la ruta de auth correctamente");
});


router.post("/register", async (req, res) => {
    try{
        const {username, email, password} = req.body as {username:string, email:string, password:string};
        const createdAt = new Date();
        const users = coleccion();

        const exists = await users.findOne({email});
        if(exists){
            return res.status(400).json({message: "Email ya existente"})
        };

        const passEncripta = await bcrypt.hash(password,10);
        await users.insertOne({username, email, passwordHash: passEncripta,createdAt });

        res.status(201).json({message: "Usuario creado correctamente!"})

    }catch(err){
        res.status(500).json({message: err});
    }
});

router.post("/login", async (req, res)=>{
    try{
        const {email, password} = req.body as {email:string, password:string};

        const users = coleccion();

        const user = await users.findOne({email});
        if(!user) return res.status(404).json({message: "email incorrecto"});

        const validPass = await bcrypt.compare(password, user.passwordHash.toString());
        if(!validPass) return res.status(404).json({message: "contraseña incorrecta"});

        console.log(user);
        console.log(SECRET);
        const token = jwt.sign({id: user._id?.toString(), email: user.email, username: user.username, passwordHash: user.passwordHash, createdAt: user.createdAt} as User, SECRET as string, {
            expiresIn: "1h"
        });

        console.log(token);

        res.status(200).json({message: "Login correcto", token})

    }catch(err){
        res.status(500).json({message: err});
    }
})



export default router;