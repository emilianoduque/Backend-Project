import { Router } from "express";
import { getProducts } from "../managers/productManager.js";

const router = Router();

router.get("/", async(req,res) => {
    const products = await getProducts();
    res.render("home", {products});
})

router.get("/realtimeproducts", async (req,res) => {
    const products = await getProducts();
    res.render("realTimeProducts", {products});
})

export default router;
