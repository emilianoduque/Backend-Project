import {Cart} from "../models/cart.model.js";
import {Product} from "../models/product.model.js";

export const getCarts = async () => {
    try {
        const carts = await Cart.find();
        return carts;
    } catch (error) {
        console.log("Error al obtener carritos", error);
        return null;
    }
};

export const getCartById = async(cartId) => {
    try {
        const cart = await Cart.findById(cartId).populate("products.product");
        return cart;
    } catch (error) {
        console.error("Error al obterner carrito", error);
        return null;
    }
}

export const createCart = async (products = []) => {
    try {
        if(!Array.isArray(products)){
            throw new Error("El formato de productos debe rer un array");            
        }
        const validatedProducts = [];

        for(const product of products){
            if(!product || !quantity || isNaN(quantity) || quantity < 1){
                throw new Error("Los productos deben tener un id vlido y una cantidad mayor a 0");
            }

            //para verificar si el prodcuto existe en mongodb;
            const existingProduct = await Product.findById(product)
            if(!existingProduct){
                throw new Error(`El producto de id ${product} no eixste`);                
            }

            validatedProducts.push({product, quantity});
        }

        const newCart = new Cart({products: validatedProducts});
        await newCart.save();
        return newCart;
    } catch (error) {
        console.error("Error al crear carrito", error);
        return null;
    }
}

export const addProductToCart = async(cartId, productId, quantity) => {
    try {
        if(!quantity || isNaN(quantity) || quantity < 1){
            console.error("Cantidad invalida", quantity);
            return null;
        }

        const cart = await Cart.findById(cartId);
        if(!cart) return null;

        //para ver si ya esta enn el carrto
        const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);
        if(productIndex >= 0){
            cart.products[productIndex].quantity += quantity;
        } else {
            //si no esta ene l carrito 
            cart.products.push({product: productId, quantity})
        }

        await cart.save();
        return cart;
    } catch (error) {
        console.error("Error al agregar prodcut al carrito", error);
        return null;
    }
}

export const updateProductQuantity = async(cartId, productId, quantity) => {
    try {
        const cart = await Cart.findById(cartId);
        if(!cart) return null;

        const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);
        if(productIndex >= 0){
            cart.products[productIndex].quantity = quantity;
            await cart.save();
            return cart;
        }

        return null;

    } catch (error) {
        console.error("Error al actualizar cantidads de producto", error);
        return null;
    }
}

export const removeProductFromCart = async(cartId, productId) => {
    try {
        const cart = await Cart.findById(cartId);
        if(!cart) return null;

        cart.products = cart.products.filter((item) => item.product.toString() !== productId); //para eliminar el producto detemrinado

        await cart.save();
        return cart;
    } catch (error) {
        console.error("Error al eliminar producto del carrito");   
        return null;
    }
}

export const clearCart = async(cartId) => {
    try {
        const cart = await Cart.findById(cartId);
        if(!cart) return null;

        cart.products = [];
        await cart.save();
        return cart;
    } catch (error) {
        console.error("Erro al vaciar el carrit", error);
        return null;
    }
}