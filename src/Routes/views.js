import { Router } from "express";
import { getProductById } from "../managers/productManager.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

const router = Router();

router.get("/", async(req,res) => {
    const {limit = 10, numPage=1} = req.query;
 
    //los pase a numberos de esta forma porque me traian un problmea raro a veces
    const limitNumber = Number(limit);
    const pageNumber = Number(numPage);
 
    const {docs,page,hasPrevPage,hasNextPage,prevPage,nextPage, totalPages} = await Product.paginate({}, {limit: limitNumber, page: pageNumber, lean: true})
 
    const prevLink = hasPrevPage ? `/?numPage=${prevPage}&limit=${limit}` : null;
    const nextLink = hasNextPage ? `/?numPage=${nextPage}&limit=${limit}` : null;
 
    res.render("home", {products: docs, hasNextPage, hasPrevPage, prevPage, nextPage, page, totalPages, prevLink, nextLink})
 });

 router.get("/realtimeproducts", async (req,res) => {
    const {limit = 10, numPage=1} = req.query;

    const limitNumber = Number(limit);
    const pageNumber = Number(numPage);
 
    const {docs,page,hasPrevPage,hasNextPage,prevPage,nextPage, totalPages} = await Product.paginate({}, {limit: limitNumber, page: pageNumber, lean: true})
 
    const prevLink = hasPrevPage ? `/realtimeproducts?numPage=${prevPage}&limit=${limit}` : null;
    const nextLink = hasNextPage ? `/realtimeproducts?numPage=${nextPage}&limit=${limit}` : null;

    res.render("realTimeProducts", {products: docs, hasNextPage, hasPrevPage, prevPage, nextPage, page, totalPages, prevLink, nextLink});
});

router.get("/products/:pid", async (req,res) => {
    const pid = req.params.pid;
    const product = await getProductById(pid);
    if(!product){
        return res.status(404).render("404", {message: "Producto no encontrado"})
    }

    res.render("productDetail", {product});
});

router.get("/cart", async(req,res) => {
    try {
        const cartId = req.query.cartId;
        if(!cartId){
            return res.status(404).send("Cart id no proporcionado");
        }

        const cart = await Cart.findById(cartId).populate("products.product");
        if(!cart){
            return res.status(404).send("Carrito no encontrado");
        }
        res.render("cart", {cart});
    } catch (error) {
        console.error("Error al obtener el carrito", error);
        res.status(500).send("Error interno del servidor");
    }
})

export default router;
