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
    _id?: ObjectId; 
    username: String, 
    email: String,
    passwordHash: String,
    createdAt: Date
}

type Product = {
_id?: ObjectId,
name: String,
description: String,
price: Number,
stock: Number, 
createdAt: Date
}

type Carts = {
    _id?: ObjectId,
    userId: ObjectId,
    items: Product[] 
}
const UserColection = () => getDb().collection<User>("Users");
const ProductColection = () => getDb().collection<Product>("Products");

router.get("/", async (req, res)=>{
  res.send("Se ha conectado a la ruta de auth correctamente");
});


router.post("api/auth/register", async (req, res) => {
    try{
        const {username, email, password} = req.body as {username:string, email:string, password:string};
        const createdAt = new Date();
        const users = UserColection();

        const exists = await users.findOne({email});
        if(exists){
            return res.status(409).json({message: "Email ya existente"})
        };

        const passEncripta = await bcrypt.hash(password,10);
        await users.insertOne({username, email, passwordHash: passEncripta,createdAt });

        res.status(201).json({message: "Usuario creado correctamente!"})

    }catch(err){
        res.status(500).json({message: err});
    }
});

router.post("api/products", async (req, res) => {
    try{
        const {name, description, price, stock} = req.body as {name: String, description: String, price: Number, stock: Number, }
        const createdAt = new Date();
        const products = ProductColection();

        const exists = await products.findOne({name});
        if(exists){
            return res.status(409).json({message: "El producto ya existe ya existente"})
        };


        await products.insertOne({name, description, price, stock, createdAt,});

        res.status(201).json({message: "Producto creado correctamente!"})

    }catch(err){
        res.status(500).json({message: err});
    }
});

router.post("api/auth/login", async (req, res)=>{
    try{
        const {email, password} = req.body as {email:string, password:string};

        const users = UserColection();

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