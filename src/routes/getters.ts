import { Router } from "express";
import { AuthRequest, verifyToken } from "../middleware/verifyToken";


const router = Router();

router.get("/user", verifyToken, (req: AuthRequest, res) => {
    res.json({
        message: "Acceso permitido",
        user: req.user
    })
});

export default router;