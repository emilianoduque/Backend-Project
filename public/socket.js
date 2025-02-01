const socket = io();

//escuchar y actualizar la lista de productos
socket.on("updatedProducts", ({products, page, totalPages}) => {
    const productsList = document.getElementById("productsList");
    productsList.innerHTML = "";
    console.log(products, page, totalPages);
    products.forEach((p) => {
        const li = document.createElement("li");
        li.innerHTML = `${p.title} - $${p.price} <button onClick="deleteProduct('${p._id}')">Borrar</button>`;
        productsList.appendChild(li);
    })

    document.querySelector(".pagination").innerHTML = `
    ${page > 1 ? `<a href="#" onclick="changePage(${page - 1})">Anterior</a>` : ""}
    Página ${page} de ${totalPages}
    ${page < totalPages ? `<a href="#" onclick="changePage(${page + 1})">Siguiente</a>` : ""}
`;

    //redirigir 
    location.reload();
})

//funcion que uso para cambiar la paginacin y traer los prdocutso correspondientes
function changePage(newPage){
    socket.emit("requestProducts", newPage);
}

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

    if (!title || isNaN(price) || isNaN(code) || isNaN(stock) || !category || !description) {
        alert("Todos los campos son obligatorios y debn ser validos.");
        return;
    }

    //aca creo el objeto product para enviarlo despues por el fetch
    const product = {
        title,
        price,
        code,
        stock,
        category,
        description
    }

    socket.emit("addProduct", product);

    addProductForm.reset();
});

//Eliminacion de productos 
function deleteProduct(productId){
    socket.emit("deleteProduct", productId);
}