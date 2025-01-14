import { Router } from "express";
import {generateId, getCarts, findCartById, saveCartsInFile} from "../managers/cartsManager.js";
import {getProducts} from "../managers/productManager.js";

const cartsRouter = Router();

cartsRouter.get("/", async(req,res) => {
    const carts = await getCarts();
    const limit = parseInt(req.query.limit);
    if(isNaN(limit) || !limit){
        res.send({status: "Success", payload: carts});
    } else {
        const cartsLimit = carts.slice(0, limit);
        res.send({cartsLimit});
    }
})

cartsRouter.post("/", async (req,res) => {
    const carts = await getCarts();
    const cartId = generateId(carts);
    const productsArray = req.body.products || [];

    if(productsArray && !Array.isArray(productsArray)){
        return res.status(400).send({message: "El campo debe ser un array"});
    }

    const newCart = {
        id: cartId,
        products: productsArray
    };

    carts.push(newCart);
    await saveCartsInFile(carts);

    return res.status(201).send({message: "Carrito creado con éxito"});
});

cartsRouter.get("/:cid", async (req,res) => {
    const cartId = parseInt(req.params.cid);
    const carts = await getCarts();
    const cartSelected = findCartById(carts, cartId);
    if(!cartSelected){
        return res.status(404).send({status: "Error", message: `Carrito de id ${cartId} no encontrado`})
    }
    return res.status(200).send({message: "Carrito encontrado", payload: cartSelected});
});

cartsRouter.post("/:cid/product/:pid", async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);

        if(isNaN(cartId) || isNaN(productId)){
            return res.status(400).send({
                status: "Error",
                message: "El id del carrito y el id del producto deben ser números válidos"
            });
        }

        const products = await getProducts();
        const productExist = products.some(product => product.id === productId);
        if(!productExist){
            return res.status(404).send({
                status: "Error",
                message: `El producto con id ${productId} no existe`
            })
        };
        
        const carts = await getCarts();
        const cartSelected = findCartById(carts, cartId);

        if(!cartSelected){
            return res.status(404).send({
                status: "Error",
                message: `El carrito con id ${cartId} no fue encontrado`
            });
        }

        const existingProduct = cartSelected.products.find(product => product.product === productId);

        if(existingProduct){
            existingProduct.quantity++;
        } else {
            cartSelected.products.push({
                product: productId,
            quantity: 1
            })
        }

        await saveCartsInFile(carts);

        return res.status(201).send({
            status: "Success",
            message: "Producto agregado con éxito"
        });
    } catch (error) {
        console.error("Error al agregar el producto al carrito:", error);
        return res.status(500).send({status: "Error", message: "Ocurrió un error al agregar el producto al carrito"});
    }
})

export default cartsRouter;