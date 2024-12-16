import { Router } from "express";
import fs from "fs";

const productsRouter = Router();

const getProducts = async () => {
    try {
        const products = await fs.promises.readFile("src/Database/products.json", "utf-8");
        const productsConveted = JSON.parse(products);
        return productsConveted;
    } catch (error) {
        return [];
    }
};

const getProductById = async(pId) => {
    const products = await getProducts();
    const product = products.find((p) => p.id === pId);
    return product;
};

const saveProducts = async (productsArray) => {
    try {
        const productsString = JSON.stringify(productsArray);
        await fs.promises.writeFile("src/Database/products.json", productsString, "utf-8");
        return true;
    } catch (error) {
        return false;
    }
};

productsRouter.get("/", async (req,res) => {
    const limit = parseInt(req.query.limit);
    const products = await getProducts();
    if(isNaN(limit) || !limit){
        res.send({status: "Success", payload: products});
    } else {
        const productsLimit = products.slice(0, limit);
        res.send({productsLimit});
    }
});

productsRouter.get("/:pid", async (req,res) => {
    const pid = parseInt(req.params.pid);
    const product = await getProductById(pid);
    if(!product){
        return res.status(404).send({status: "Error", message: "Producto no encontrado"})
    }
    res.send({product});
});

productsRouter.post("/", async (req, res) => {
    const product = req.body;
    const products = await getProducts();
    if(products.length === 0){
        product.id = 1;
    } else {
        product.id = products[products.length - 1].id + 1;
    }

    if(!product.title || !product.description || !product.code || !product.price || product.stock === undefined || !product.category){
        return res.status(400).send({message: "Faltan campos requeridos"});
    };

    if(isNaN(product.price)) {
        return res.status(400).send({message: "El precio debe ser un numero"});
    }
    products.push(product);
    const savedProducts = await saveProducts(products);
    if(!savedProducts){
        return res.send({status: "Error", message: "El producto no pudo ser añadido"})
    }
    res.send({status: "Success", message: "Producto añadido"})
});

productsRouter.delete("/:pid", async (req,res) => {
    const pid = parseInt(req.params.pid);
    const product = await getProductById(pid);
    if(!product){
        return res.status(404).send({status: "Error", message: "Producto no encontrado"})
    }
    const products = await getProducts();
    const newProducts = products.filter((p) => p.id !== pid);
    const productsSaved = await saveProducts(newProducts);
    if(!productsSaved){
        return res.status(400).send({status: "Error", message: "Algo salió mal"}
        )
    }
    res.send({status: "Succes", message: "Producto eliminado"})
});

productsRouter.put("/:pid", async (req,res) => {
    const productId = parseInt(req.params.pid);
    const productToUpdate = req.body;
    const products = await getProducts();
    let product = products.find((p) => p.id === productId);
    if(!productToUpdate.title || !productToUpdate.description || !productToUpdate.code || !productToUpdate.price || productToUpdate.stock === undefined || !productToUpdate.category){
        return res.status(400).send({message: "Faltan campos requeridos"});
    };
    if(!product){
        return res.status(404).send({status: "Error", message: "Producto no encontrado"});
    };
    
    const updatedProducts = products.map(p => {
        if(p.id == productId){
            return {
                ...productToUpdate,
                id: productId
            }
        }
        return p;
    });

    const savedProducts = await saveProducts(updatedProducts);
    if(!savedProducts){
        return res.status(400).send({status: "Error", message: "Algo salió mal"});
    }
    res.send({status: "Success", message: `Producto de id ${productId} cambiado`})
});

export default productsRouter;


