'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'alfa-tango--secretapara-token123344333423442424313342342342432423'

exports.authenticated = function(req, res, next) {
    //comprobar si llega authorization
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'La peticion no tiene la cabecera de authorization'
        });
    }
    //Limpiar el token y quitar comillas
    var token = req.headers.authorization.replace(/['"]+/g, '');

    //decodificar el token
    try {
        //decodificar el token

        var payload = jwt.decode(token, secret);

        //Comprobar si el token a expirado
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                message: 'El token ha expirado'
            });
        }


    } catch (ex) {
        return res.status(404).send({
            message: 'El token no es valido'
        });
    }


    //adjuntar usuario identificado a la request
    req.user = payload;

    //pasar a la accion
    next();
}