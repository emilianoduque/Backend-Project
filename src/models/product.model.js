import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new Schema({
    title: {type: String, required: true}, 
    description: {type: String, required: true},
    price: {type: Number, required: true},
    category: {type: String, required: true},
    stock: {type: Number, required: true},
    availability: {type: Boolean, default: true},
});

productSchema.plugin(mongoosePaginate);

export const Product = model("Products", productSchema)

