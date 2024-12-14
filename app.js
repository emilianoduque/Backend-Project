import express from "express";
import productsRouter from "./src/Routes/products.js";
import cartsRouter from "./src/Routes/carts.js";

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.listen(PORT, () => {
    console.log(`Escuchando puerto ${PORT}`)
})