import express from "express";
import productsRouter from "./src/Routes/products.js";
import cartsRouter from "./src/Routes/carts.js";
import handlebars from "express-handlebars";
import viewsRouter from "./src/Routes/views.js";
import {createServer} from "http";
import { Server } from "socket.io";
import { getProducts, saveProducts } from "./src/managers/productManager.js";

const PORT = 8080;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

app.get("/", async (req, res) => {
    const products = await getProducts();
    res.render("home", {title:"Inicio", products: products});
})

app.get("/realtimeproducts", (req,res) => {
    res.render("realTimeProducts", {title: "Productos en Tiempo Real"})
})

io.on("connection", (socket) => {
    console.log("Usuario Conectado");

    socket.on("addProduct", async(product) => {
        //añadir productso
        const products = await getProducts()
        products.push({id: products.length + 1, ...product});
        await saveProducts(products);
        io.emit("updatedProducts", products);
    })

    socket.on("deleteProduct", async(productId) => {
        const products = await getProducts();
        const newProducts = products.filter((product) => product.id !== productId);
        await saveProducts(newProducts);

        io.emit("updatedProducts", newProducts);
    })

    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    })
})

httpServer.listen(PORT, () => {
    console.log(`Escuchando puerto ${PORT}`)
})

export {io};