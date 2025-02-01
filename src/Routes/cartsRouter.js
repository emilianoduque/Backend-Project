import { Router } from "express";
import {getCarts, getCartById, createCart, addProductToCart, updateProductQuantity, removeProductFromCart, clearCart} from "../managers/cartsManager.js";
import {getProductById} from "../managers/productManager.js";
import {io} from "../../app.js";

const cartsRouter = Router();

cartsRouter.get("/", async(req,res) => {
    const carts = await getCarts();
    if(!carts){
        return res.status(500).send({status: "Error", message: "No se pudieron obtner los carritos"});
    }
    res.send({status: "Success", payload: carts});
});

cartsRouter.post("/", async (req,res) => {
    try {
        const {products} = req.body;
        const newCart = await createCart(products || []);

        if(!newCart){
            return res.status(500).send({status: "Error", message: "No se pudo crear el carrito"})
        }
        res.status(201).send({status: "Success", payload: newCart})
    } catch (error) {
        console.error("Error al crear carrito", error);
        res.status(500).send({status: "Error", message: error.message || "ocurrio un error al crear sl carrito"})
    }
});

cartsRouter.get("/:cid", async (req,res) => {
    const {cid} = req.params;
 
    const cart = await getCartById(cid);
    if(!cart){
     console.log("Carrito no encontrado con el cid: ", cid);
     return res.status(404).send({status: "Error", message: "Carrito no encontrado"})
    }
    res.send({status: "Success", payload: cart});
 });

 cartsRouter.post("/:cid/product/:pid", async (req, res) => {
    try {
        const {cid, pid} = req.params;
        let {quantity } = req.body;
        quantity = Number(quantity) || 1;

        if(quantity < 1){
            return res.status(400).send({status: "Error", message:"Cantidad invalida"});
        }

        const product = await getProductById(pid);
        if(!product){
            return res.status(404).send({status: "Error", message: "Producto no encontrado"});
        }
        const updatedCart = await addProductToCart(cid, pid, quantity);

        if(!updatedCart){
            return res.status(500).send({status: "Error", message: "No se pudo agreg el producto al carrito"});
        }

        res.status(201).send({status: "Success", payload: updatedCart});
    } catch (error) {
        console.error("Error al agregar el producto al carrito:", error);
        return res.status(500).send({status: "Error", message: "Ocurrió un error al agregar el producto al carrito"});
    }
});

cartsRouter.put("/:cid/product/:pid", async(req,res) => {
    try {
        const {cid, pid} = req.params;
        const {quantity} = req.body;
    
        if(!quantity || isNaN(quantity)){
            return res.status(400).send({status: "Error", message: "Cantidad inválida"})
        }
        
        const product = await getProductById(pid);
        if(!product){
            return res.status(404).send({status: "Error", message: "Producto no encontrado"})
        }
    
        const updatedCart = await updateProductQuantity(cid, pid, quantity);
        if(!updatedCart){
            return res.status(404).send({status: "Error", message:"Carrito no encontrado"});
        }
    
        res.send({status: "Success", payload: updatedCart}); 
    } catch (error) {
        console.error("Error al actualizar cantidad", error);
        return res.status(500).send({status: "Error", message: "Ocurrió un error al sumar cantidad del producto al carrito"});
    }
});

cartsRouter.delete("/:cid/product/:pid", async(req,res) => {
    try {
        const {cid, pid} = req.params;
    
        const product = await getProductById(pid);
        if(!product){
            return res.status(404).send({status: "Error", message: "Producto no encontrado"})
        }

        const updatedCart = await removeProductFromCart(cid, pid);
        if(!updatedCart){
            return res.status(404).send({status: "Error", message: "Carrito no encontrado"})
        }
        res.send({status: "Success", payload: updatedCart});
    } catch (error) {
        console.error("Error al borrar producto del carrito", error);
        return res.status(500).send({status: "Error", message: "Ocurrió un error al borrar producto del carrito"});
    }
});

cartsRouter.delete("/:cid", async(req,res) => {
    try {
        const {cid} = req.params;
    
        const clearedCart = await clearCart(cid);
        if(!clearedCart){
            return res.status(404).send({status: "Error", message: "Carrito no encontrado"});
        }
        
        res.send({status: "Success", payload: clearedCart});
    } catch (error) {
        console.error("Error al borrar carrito", error);
        return res.status(500).send({status: "Error", message: "Ocurrió un error al borrar carrito"});
    }
})

export default cartsRouter;