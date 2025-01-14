import fs from "fs";

const getCarts = async () =>{
    try {
        const carts = await fs.promises.readFile("src/Database/carts.json", "utf-8");
        const cartsConverted = JSON.parse(carts);
        return cartsConverted;
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

const generateId = (carts) => {
    return carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
};

export {generateId, saveCartsInFile, findCartById, getCarts}