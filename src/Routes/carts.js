import { Router } from "express";
import fs from "fs";

const cartsRouter = Router();

const getCarts = async () =>{
    try {
        const carts = await fs.promises.readFile("src/Database/carts.json", "utf-8");
        const cartsConverted = JSON.parse(carts);
        return cartsConverted;
    } catch (error) {
        return [];
    }
};

const readCartsFile = async () => {
    try {
        const dataCarts = await fs.promises.readFile("src/Database/carts.json");
        return JSON.parse(dataCarts);
    } catch (error) {
       return []; 
    }  

};

const findCartById = (carts, cartId) => {
    return carts.find(cart => cart.id === cartId);
};

const saveCartsInFile = async (carts) => {
    try {
        await fs.promises.writeFile("src/Database/carts.json", JSON.stringify(carts), "utf-8")
        return true;
    } catch (error) {
        console.error("Error al guardar el archivo de carritos: ", error)
        return false;
    }
};

const readProductsFile = async () => {
    try {
        const dataProducts = await fs.promises.readFile("src/Database/products.json", "utf-8");
        return JSON.parse(dataProducts);
    } catch (error) {
        console.warn("El archivo de productos no existe o hubo un error al intentar leerlo")
        return [];
    }
};

const generateId = (carts) => {
    return carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
};

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

        const products = await readProductsFile();
        const productExist = products.some(product => product.id === productId);
        if(!productExist){
            return res.status(404).send({
                status: "Error",
                message: `El producto con id ${productId} no existe`
            })
        };
        
        const carts = await readCartsFile();
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