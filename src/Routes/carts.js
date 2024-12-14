import { Router } from "express";
import fs from "fs";

const cartsRouter = Router();

const readCartsFile = () => {
    if(!fs.existsSync("src/Database/carts.json")){
        return [];
    };
    const data = fs.readFileSync("src/Database/carts.json");
    return JSON.parse(data);
}

const findCartById = (carts, cartId) => {
    return carts.find(cart => cart.id === cartId);
}

const saveCartsInFile = (carts) => {
    fs.writeFileSync("src/Database/carts.json", JSON.stringify(carts));
}

const readProductsFile = () => {
    if(!fs.existsSync("src/Database/products.json")){
        console.warn("El archivo de productos no existe.");
        return [];
    }
    try {
        const data = fs.readFileSync("src/Database/products.json", "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error leyendo el archivo de productos:", error);
        return[];
   }
}
const generateId = (carts) => {
    return carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
};

cartsRouter.post("/", (req,res) => {
    const carts = readCartsFile();
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
    saveCartsInFile(carts);

    return res.status(201).send({message: "Carrito creado con éxito"});
});

cartsRouter.get("/:cid", (req,res) => {
    const cartId = parseInt(req.params.cid);
    const carts = readCartsFile();
    const cartSelected = findCartById(carts, cartId);
    if(!cartSelected){
        return res.status(404).send({status: "Error", message: `Carrito de id ${cartId} no encontrado`})
    }
    return res.status(200).send({message: "Carrito encontrado", payload: cartSelected});
});

cartsRouter.post("/:cid/product/:pid", (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);

        if(isNaN(cartId) || isNaN(productId)){
            return res.status(400).send({
                status: "Error",
                message: "El id del carrito y el id del producto deben ser números válidos"
            });
        }

        const products = readProductsFile();
        const productExist = products.some(product => product.id === productId);
        if(!productExist){
            return res.status(404).send({
                status: "Error",
                message: `El producto con id ${productId} no existe`
            })
        }

        const carts = readCartsFile();
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

        saveCartsInFile(carts);

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