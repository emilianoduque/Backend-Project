import express from "express";
import productsRouter from "./src/Routes/productsRouter.js";
import cartsRouter from "./src/Routes/cartsRouter.js";
import handlebars from "express-handlebars";
import viewsRouter from "./src/Routes/views.js";
import {createServer} from "http";
import { Server } from "socket.io";
import { getProducts, createProduct, deleteProduct } from "./src/managers/productManager.js";
import connectDB from "./src/config/config.js";
import { Cart } from "./src/models/cart.model.js";

const PORT = 8080;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.engine("handlebars", handlebars.engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true, //utilicé esta solucion para dar acceso a propiedades porque tenia errores al leer en handlebars
    }
}));
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

app.get("/", async (req, res) => {
    const products = await getProducts();
    if(products && products.length > 0){
        res.render("home", {title:"Inicio", products: products});
    } else {
        res.render("home", {title: "Inicio", products: [], message: "No hay productos disponibles."});
    }
})

app.get("/realtimeproducts", async(req,res) => {
    const products = await getProducts();
    if(products && products.length > 0){
        res.render("realTimeProducts", {title: "Productos en Tiempo Real", products});
    } else {
        res.render("realTimeProducts", {title: "Productos en Tiempo Real", products: [], message: "No hay productos disponibles"})
    }
});

io.on("connection", (socket) => {
    console.log("Usuario Conectado");

    socket.on("addProduct", async(product) => {
        try {
            //crear productso
            const newProduct = await createProduct(product);
            if(newProduct){
                const productsData = await getProducts({}, 10, 1);

                console.log("Enviando datos al cliente:", {
                    products: productsData.products,
                    page: productsData.page, 
                    totalPages: productsData.totalPages,
                });

                io.emit("updatedProducts", {
                    products: productsData.products, 
                    page: productsData.page,
                    totalPages: productsData.totalPages,
                });
            } else {
                socket.emit("error", {message: "No se pudo crear el producto"})
            }
            
        } catch (error) {
            console.error("Error al crear producto:", error);
            socket.emit("error", { message: "ocurrió un error en el servidor." })
        }
    })

    socket.on("requestProducts", async(page) => {
        const productsData = await getProducts({}, 10, page);
        socket.emit("updatedProducts", {
            products: productsData.products,
            page: productsData.page,
            totalPages: productsData.totalPages,
        })
    })

    socket.on("deleteProduct", async(productId) => {
        try {
            const deleted = await deleteProduct(productId);
            if(deleted){
                const productsData = await getProducts({}, 10, 1); 
                console.log("productsData devuelve: ", productsData);
                io.emit("updatedProducts", {
        
                products: productsData.products,
                page: productsData.page,
                totalPages: productsData.totalPages
            });
            } else {
                socket.emit("error", {message: "No se pudo eliminar el prducto"})
            }
            
        } catch (error) {
            console.error("Error la eliminar producot", error);
            socket.emit("error", {message: "ocurrio un error en el servidor"})
        }
    })

    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    })
})

connectDB();

httpServer.listen(PORT, () => {
    console.log(`Escuchando puerto ${PORT}`)
})

export {io};