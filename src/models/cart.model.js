import { Schema, model} from "mongoose";
import {Product} from "./product.model.js";

const cartSchema = new Schema({
    products: [
        {
            product: {type: Schema.Types.ObjectId, ref: Product, required: true},
            quantity: {type: Number, required: true},
        },
    ],
});

export const Cart = model("Carts", cartSchema);
