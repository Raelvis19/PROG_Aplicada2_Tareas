const express = require('express');
const app = express();

app.use(express.json());
app.listen(3000 , () => console.log("Servidor escuchando en el puerto 3000"));

let productos = [
    {
        id: 1,
        Nombre: "iPhone 17 Pro Max",
        Precio: 80000,
        Cantidad: 1
    }
   

];

let nextId = 2;

app.get('/productos', (req,res)=>{
    res.json(productos);
})

app.post('/productos', (req,res)=>{
    const Nombre = req.body.Nombre;
    const Precio = req.body.Precio;
    const Cantidad = req.body.Cantidad;
    const producto = {id:nextId++, Nombre, Precio, Cantidad};
    productos.push(producto);
    res.status(201).json(producto);
})

app.put('/productos/:id', (req,res)=>{
   const producto = productos.find(p=>p.id === parseInt(req.params.id));
   if(!producto) return res.status(404).json({error:"Producto no encontrado"});
   const cantidad = req.body.Cantidad;
   if(cantidad!==undefined) producto.Cantidad = cantidad;
   res.json(producto);

})

app.delete('/productos/:id',(req,res)=>{
    const index = productos.findIndex(p=>p.id===parseInt(req.params.id));
    if(index===-1) return res.status(404).json({error:"Producto no encontrada"});
    productos.splice(index,1);
    res.json({mensaje:"Eliminado"});

})

app.get('/productos/total', (req, res) => {

    const total = productos.reduce((acumulador, producto) => {
        return acumulador + (producto.Precio * producto.Cantidad);
    }, 0);

    res.json({ total });

});

app.post('/carrito/aplicar-descuento', (req, res) => {

    const porcentaje = req.body.porcentaje;

    const total = productos.reduce((acumulador, producto) => {
        return acumulador + (producto.Precio * producto.Cantidad);
    }, 0);

    const descuento = total * (porcentaje / 100);

    const totalConDescuento = total - descuento;

    res.json({
        total,
        porcentaje,
        descuento,
        totalConDescuento
    });
});

//Investigue en internet sobre como podia hacer el calculo del total del carrito y el
//desceunto en javascript y me tope con reduce() dice que es un metodo que sirve sirve 
// para recorrer un array y convertir todos sus elementos en un unico resultado.
//lo cual era exactamente lo que se necesitaba hacer en el ejercicio  y yo al principio 
//no encontraba una manera de hacerlo en este lenguaje