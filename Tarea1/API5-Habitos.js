const express = require('express');

const app = express();

app.use(express.json());

app.listen(3000, () => {
    console.log("Servidor escuchando en el puerto 3000");
});



let habitos = [];

let nextId = 1;




app.post('/habitos', (req, res) => {

    const { nombre, meta } = req.body;

    const habito = {
        id: nextId++,
        nombre,
        meta,
        registros: []
    };

    habitos.push(habito);

    res.status(201).json(habito);
});




app.get('/habitos', (req, res) => {

    res.json(habitos);

});




app.post('/habitos/:id/registrar', (req, res) => {

    const id = parseInt(req.params.id);

    const habito = habitos.find(h => h.id === id);

    if (!habito) {
        return res.status(404).json({
            error: "habito no encontrado"
        });
    }



    const fecha = new Date()
        .toISOString()
        .split('T')[0];


  
    const yaRegistrado = habito.registros.some(
        registro => registro.fecha === fecha
    );


    if (yaRegistrado) {

        return res.status(400).json({
            error: "El habito ya fue registrado hoy"
        });

    }


  
    habito.registros.push({
        fecha: fecha,
        completado: true
    });


    res.json(habito);

});


app.get('/habitos/:id/estadisticas', (req, res) => {

    const id = parseInt(req.params.id);

    const habito = habitos.find(h => h.id === id);


  
    if (!habito) {

        return res.status(404).json({
            error: "habito no encontrado"
        });

    }


  
    const registros = [...habito.registros].sort(
        (a, b) => a.fecha.localeCompare(b.fecha)
    );


 

    const completados = registros.filter(
        registro => registro.completado
    );


    const porcentajeCumplimiento =
        registros.length === 0
            ? 0
            : (completados.length / registros.length) * 100;




    let racha = 0;

    let mejorRacha = 0;


    for (let i = 0; i < registros.length; i++) {

       
        if (!registros[i].completado) {

            racha = 0;

            continue;
        }


   
        if (i > 0) {

            const dias = diferenciaDias(
                registros[i - 1].fecha,
                registros[i].fecha
            );


            if (dias !== 1) {
                racha = 0;
            }

        }


        racha++;


        if (racha > mejorRacha) {
            mejorRacha = racha;
        }

    }


    let rachaActual = 0;


    for (let i = registros.length - 1; i >= 0; i--) {

        if (!registros[i].completado) {
            break;
        }


        if (i < registros.length - 1) {

            const dias = diferenciaDias(
                registros[i].fecha,
                registros[i + 1].fecha
            );


            if (dias !== 1) {
                break;
            }

        }


        rachaActual++;

    }


  
    res.json({

        habito: habito.nombre,

        rachaActual: rachaActual,

        mejorRacha: mejorRacha,

        porcentajeCumplimiento:
            Number(porcentajeCumplimiento.toFixed(2))

    });

});




app.delete('/habitos/:id', (req, res) => {

    const id = parseInt(req.params.id);


    const indice = habitos.findIndex(
        h => h.id === id
    );


    
    if (indice === -1) {

        return res.status(404).json({
            error: "habito no encontrado"
        });

    }


   
    habitos.splice(indice, 1);


    res.json({
        mensaje: "habito eliminado"
    });

});




function diferenciaDias(fecha1, fecha2) {

    const primera = new Date(fecha1);

    const segunda = new Date(fecha2);


    const diferencia = segunda - primera;


    return diferencia / (1000 * 60 * 60 * 24);

}