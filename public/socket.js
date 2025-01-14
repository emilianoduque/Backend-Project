const socket = io();

socket.on("updatedProducts", (products) => {
    const productsList = document.getElementById("productsList");
    productsList.innerHTML = "";
    products.forEach(el => {
        const li = document.createElement("li");
        li.textContent = `${el.title} - ${el.price}`
        productsList.appendChild(li);
    });
})

//Formulario para añadir productos
const addProductForm = document.getElementById("addProductForm");
addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const price = parseFloat(document.getElementById("price").value);
    const code = parseInt(document.getElementById("code").value);
    const stock = parseInt(document.getElementById("stock").value);
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;

    //aca creo el objeto product para enviarlo despues por el fetch
    const product = {
        title,
        price,
        code,
        stock,
        category,
        description
    }

    try {
        const response = await fetch("/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product) //le mando el producto y espero la response
        })

        const result = await response.json();
        if(response.ok){
            console.log("Producto añadido con exito", result.message);
        } else {
            console.log("Error al añadir producto", result.message);
        }
    } catch (error) {
        console.log("Error al enviar la solicitud", error);
    }

    //para limpiar el form
    addProductForm.reset();
})

//Eliminacion de productos 
function deleteProduct(productId){
    socket.emit("deleteProduct", productId);
}

//Escuchas y actualizar la lista de productos
socket.on("updatedProducts", (products) => {
    const productsList = document.getElementById("productsList");
    productsList.innerHTML = "";
    products.forEach(p => {
        const li = document.createElement("li");
        li.innerHTML = `${p.title} - $${p.price} <button onClick="deleteProduct(${p.id})">Borrar</button>`;
        productsList.appendChild(li);
    })
})