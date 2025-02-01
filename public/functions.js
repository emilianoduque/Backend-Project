async function addToCart(productId){
    let cartId = localStorage.getItem("cartId");

    //si no teine carrito crea uno nuevo
    if(!cartId){
        const response = await fetch("/api/carts/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        if(data.status !== "Success"){
            alert("Error al crear carrito");
            return;
        }
       
        cartId = data.payload._id; //guardo el nuevo id del carrito
        localStorage.setItem("cartId", cartId); //usé el local para guardar la id en el navegador para luego acceder en la funcion addToCart
    }

    //para esperar la respuesta del fetch antes de seguir
    const productResponse = await fetch(`/api/carts/${cartId}/product/${productId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({quantity: 1})
    })
    
    const productData = await productResponse.json();

    if(productData.status === "Success"){
        alert("Producto agregado al carrito");      
    } else {
        alert("Error al agregar producto");
    }
    
};

function goToCart(){
    const cartId = localStorage.getItem("cartId");
    if(!cartId){
        alert("No tienes un carrito activo");
        return;
    }
    
    window.location.href = `/cart?cartId=${cartId}`;
}

async function createNewCart(){
    const response = await fetch("/api/carts/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    });

    const data = await response.json();
    if(data.status === "Success"){
        return data.payload._id; //para devolver el nuevo cardId
    } else {
        alert("Error al crear nuevo carrito");
        return null;
    }

}