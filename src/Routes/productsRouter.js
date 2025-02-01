import { Router } from "express";
import {getProducts, getProductById, createProduct, updateProduct, deleteProduct} from "../managers/productManager.js";
import {io} from "../../app.js";

const productsRouter = Router();

productsRouter.get("/", async(req,res) => {
    const {limit,page,sort,category} = req.query;
    const query = category ? {category} : {};

    const products = await getProducts(query, parseInt(limit) || 10, parseInt(page) || 1, sort);
    if(!products) {
        return res.status(500).send({status:"Error", message: "No se pudieron obtener los productos"});
    };
    res.send({status: "Success", payload: products});
});

productsRouter.get("/:pid", async(req,res) => {
    const {pid} = req.params;
    const product = await getProductById(pid);
    if(!product){
        return res.status(404).send({status: "Error", message: "Producto no encontrado"});
    }

    //prueba para dejar almacenado el carrito del usuario
    const cartId = req.session.cartID || null;
    res.send({status: "Success", paylaod: product});

    res.render("productDetail", {product,cartId});
});

productsRouter.post("/", async (req,res) => {
    const productData = req.body;
    const requiredFields = ["title", "description", "code", "price", "stock", "category"];

    for(const field of requiredFields){
        if(!productData[field]){
            return res.status(404).send({status: "Error", message: `Falta el campoi requerido ${field}`})
        }
    }

    const newProduct = await createProduct(productData);
    if(!newProduct){
        return res.status(500).send({status: "Error", message: "No se pudo crear el producto"});
    }

    io.emit("updatedProducts", await getProducts());
    res.status(201).send({status: "Success", payload: newProduct});
})

productsRouter.delete("/:pid", async(req,res) => {
    const {pid} = req.params;

    const deleted = await deleteProduct(pid);
    if(!deleted){
        return res.sendStatus(404).send({status: "Error", message: "producto no encontrado o no se pudo borrar"});
    }
    
    io.emit("updatedProducts", await getProducts());
    res.send({status: "Success", message: "Producto eliminado con exito"});
});

productsRouter.put("/:pid", async (req, res) => {
    const {pid} = req.params;
    const updateData = req.body;

    const updatedProduct = await updateProduct(pid, updateData);
    if(!updatedProduct){
        return res.status(404).send({status: "Error", message: "Producto no encontrado o no pudo actualizarse"});
    }

    io.emit("updatedProducts", await getProducts());
    res.send({status: "Success", payload: updatedProduct});
})

export default productsRouter;