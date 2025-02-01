import {Product } from "../models/product.model.js";

export const getProducts = async(query = {}, limit =10, page=1, sort=null) => {
    try {
        const options = {
            limit,
            page,
            sort: sort ? {price: sort} : null,
        }

        const result = await Product.paginate(query, options)
        console.log("resultado", result);
        
        return {
            products: result.docs || [],
            page:  1,
            totalPages: result.totalPages || 1
        };

        // const {docs: products} = await Product.paginate(query, options);
        // return products;
    } catch (error) {
        console.error("Error al obtenr productos", error);
        return {
            products: [], 
            page: 1, 
            totalPages: 1
        };
    }
};

export const getProductById = async(pId) => {
    try {
        const product = await Product.findById(pId);
        return product;
    } catch (error) {
        console.error("Erro al obtener el producto", error);
        return null;
    }
};

export const createProduct = async(productData) => {
    try {
        const newProduct = new Product(productData);
        await newProduct.save();
        return newProduct;
    } catch (error) {
        console.error("Error al crear producto", error);
        return null;
    }
};

export const updateProduct = async(pId, updateData) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(pId, updateData, {
            new: true,
        });
        return updatedProduct;
    } catch (error) {
        console.error("Error al actualizar el producto", error);
        return null;       
    }
};

export const deleteProduct = async(pId) => {
    try {
        await Product.findByIdAndDelete(pId);
        return true;
    } catch (error) {
        console.error("Error al eliminar el producto", error);
        return false;
    }
}