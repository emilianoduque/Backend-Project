import fs from "fs";

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

export {getProductById, getProducts, saveProducts}