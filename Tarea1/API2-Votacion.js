const express = require('express');
const app = express();

app.use(express.json());
app.listen(3000 , () => console.log("Servidor escuchando en el puerto 3000"));

let encuestas = [];
let nextId = 1;

app.post('/encuestas', (req, res) => {

    const { pregunta, opciones } = req.body;

    if (!pregunta || !opciones) {
        return res.status(400).json({
            error: "Pregunta y opciones son obligatorias"
        });
    }

    if (opciones.length < 2) {
        return res.status(400).json({
            error: "La encuesta debe tener minimo 2 opciones"
        });
    }

    const encuesta = {
        id: nextId++,
        pregunta,
        opciones: opciones.map(opcion => ({
            nombre: opcion,
            votos: 0
        }))
    };

    encuestas.push(encuesta);

    res.status(201).json(encuesta);
});

app.get('/encuestas', (req, res) => {
    res.json(encuestas);
});

app.post('/encuestas/:id/votar', (req, res) => {

    const encuesta = encuestas.find(
        e => e.id === parseInt(req.params.id)
    );

    if (!encuesta) {
        return res.status(404).json({
            error: "Encuesta no encontrada"
        });
    }

    const opcion = encuesta.opciones.find(
        o => o.nombre === req.body.opcion
    );

    if (!opcion) {
        return res.status(400).json({
            error: "La opción no existe en esta encuesta"
        });
    }

    opcion.votos++;

    res.json({
        mensaje: "Voto registrado",
        opcion: opcion.nombre,
        votos: opcion.votos
    });
});

app.get('/encuestas/:id/resultados', (req, res) => {

    const encuesta = encuestas.find(
        e => e.id === parseInt(req.params.id)
    );

    if (!encuesta) {
        return res.status(404).json({
            error: "Encuesta no encontrada"
        });
    }

    const totalVotos = encuesta.opciones.reduce(
        (total, opcion) => total + opcion.votos,
        0
    );

    const resultados = encuesta.opciones.map(opcion => {

        const porcentaje = totalVotos === 0
            ? 0
            : (opcion.votos / totalVotos) * 100;

        return {
            opcion: opcion.nombre,
            votos: opcion.votos,
            porcentaje: porcentaje
        };
    });

    const ganador = encuesta.opciones.reduce(
        (mayor, opcion) =>
            opcion.votos > mayor.votos ? opcion : mayor
    );

    res.json({
        pregunta: encuesta.pregunta,
        totalVotos,
        resultados,
        ganador: ganador.nombre
    });
});

app.delete('/encuestas/:id', (req, res) => {

    const id = parseInt(req.params.id);

    const indice = encuestas.findIndex(
        encuesta => encuesta.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            error: "Encuesta no encontrada"
        });
    }

    encuestas.splice(indice, 1);

    res.json({
        mensaje: "Encuesta eliminada"
    });
});

