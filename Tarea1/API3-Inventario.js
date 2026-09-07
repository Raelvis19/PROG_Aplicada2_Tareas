const express = require('express');
const app = express();

app.use(express.json());
app.listen(3000 , () => console.log("Servidor escuchando en el puerto 3000"));

let inventario = [];

let nextId = 1;

app.get('/inventario', (req, res) => {
    res.json(inventario);
});

app.post('/inventario', (req, res) => {

    const producto = req.body.producto;
    const stock = req.body.stock;
    const stockMinimo = req.body.stockMinimo ?? 5;

    const nuevoProducto = {
        id: nextId++,
        producto,
        stock,
        stockMinimo
    };

    inventario.push(nuevoProducto);

    res.status(201).json(nuevoProducto);
});

app.post('/inventario/:id/entrada', (req, res) => {

    const id = parseInt(req.params.id);

    const producto = inventario.find(p => p.id === id);

    if (!producto) {
        return res.status(404).json({
            error: "Producto no encontrado"
        });
    }

    const cantidad = req.body.cantidad;

    producto.stock += cantidad;

    res.json(producto);
});

app.post('/inventario/:id/salida', (req, res) => {

    const id = parseInt(req.params.id);

    const producto = inventario.find(p => p.id === id);

    if (!producto) {
        return res.status(404).json({
            error: "Producto no encontrado"
        });
    }

    const cantidad = req.body.cantidad;

    if (cantidad > producto.stock) {
        return res.status(400).json({
            error: "No hay suficiente stock disponible"
        });
    }

    producto.stock -= cantidad;

    res.json(producto);
});

app.get('/inventario/alertas', (req, res) => {

    const alertas = inventario
        .filter(producto => producto.stock < producto.stockMinimo)
        .map(producto => ({
            id: producto.id,
            producto: producto.producto,
            stock: producto.stock,
            stockMinimo: producto.stockMinimo,
            falta: producto.stockMinimo - producto.stock
        }));

    res.json(alertas);
});