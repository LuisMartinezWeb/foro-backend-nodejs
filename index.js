'use strict'

var moongose = require('mongoose');
var app = require('./app');
var port = process.env.port || 3999;

moongose.set('useFindAndModify', false);
moongose.Promise = global.Promise;

moongose.connect('mongodb://localhost:27017/api_rest_node', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('la conexion a la base de datos fue exitosa');

        //crear el servidor

        app.listen(port, () => {
            console.log('el servidor http://localhost:3999 esta funcionando...');
        });
    })
    .catch(error => console.log(error));