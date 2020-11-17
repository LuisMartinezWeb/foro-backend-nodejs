'use strict'
var validator = require('validator');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');
const { exists } = require('../models/user');

var controller = {

    probando: function(req, res) {
        return res.status(200).send({
            messaje: "soy el metodo probando"
        });
    },

    testeando: function(req, res) {
        return res.status(200).send({
            messaje: "soy el metodo testeando"
        });
    },

    save: function(req, res) {
        //recoger los parametros de la peticion

        var params = req.body;

        //validar los datos

        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {

            return res.status(200).send({
                message: "faltan datos por enviar",

            });
        }

        //console.log(validate_name, validate_surname, validate_email, validate_password);

        if (validate_name && validate_surname && validate_password && validate_email) {

            //crear el objeto de usuario
            var user = new User();

            //asignar valores al objeto usuario con los datos que recibimos
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;
            //comprobar si el usuario existe
            User.findOne({ email: user.email }, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error al comprobar duplicidad de usuario",

                    });
                }

                if (!issetUser) {

                    //si no existe, cifrar la contraseña
                    bcrypt.hash(params.password, saltRounds, (err, hash) => {
                        user.password = hash;

                        //y guardar usuarios
                        user.save((err, userStored) => {
                            if (err) {
                                return res.status(500).send({
                                    message: "Error al guardar el usuario",

                                });
                            }
                            if (!userStored) {
                                return res.status(400).send({
                                    message: "El usuario no se ah guardado",

                                });
                            }
                            //devorlver una respuesta
                            return res.status(200).send({
                                status: 'success',
                                user: userStored

                            });
                        }); //close save
                    }); //close bcrypt


                } else {
                    return res.status(500).send({
                        message: "El usuario ya esta registrado",

                    });
                }
            });


        } else {
            return res.status(200).send({
                message: "La validacion de los datos del usuario incorrecta, intentalo de nuevo",

            });
        }
    },

    login: function(req, res) {
        //recoger los parametros de la peticion
        var params = req.body;

        //validar los datos
        var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password = !validator.isEmpty(params.password);

        if (!validate_email || !validate_password) {
            return res.status(500).send({
                message: "Los datos son incorrectos, envialos bien"
            });
        }
        //Buscar los datos que coincidan con el email
        User.findOne({ email: params.email.toLowerCase() }, (err, user) => {

            if (err) {

                return res.status(500).send({
                    message: "Error al identificarse"
                });
            }
            if (!user) {
                return res.status(404).send({
                    message: "El usuario no existe"
                });
            }
            //si lo encuentra,

            //comprobar la contraseña( coincidencia de email y password/bcrypt)
            bcrypt.compare(params.password, user.password, (err, check) => {
                //si es correcto, 
                if (check) {
                    //generar token de jwt   y devolverlo (mas tarde)
                    if (params.gettoken) {
                        //devolver los datos
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //limpiar el objeto 
                        user.password = undefined;
                        //devolver los datos

                        return res.status(200).send({
                            message: "success",
                            user
                        });
                    }
                } else {
                    return res.status(200).send({
                        message: "Las credenciales no son correctas"
                    });
                }

            });


        });

    },

    update: function(req, res) {
        //recoger los datos del body
        var params = req.body;
        console.log(req.user.email);
        console.log(params.email);
        //validar datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {

            return res.status(200).send({
                message: "faltan datos por enviar"

            });
        }


        //eliminar propiedades inecesarias
        delete params.password;
        var userId = req.user.sub;

        //comprobar si el email es unico

        if (req.user.email != params.email) {
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
                if (err) {

                    return res.status(500).send({
                        message: "Error al identificarse"
                    });
                }
                if (user && user.email == params.email) {
                    return res.status(200).send({
                        message: "El email no puede ser modificado"
                    });
                } else {

                    //Buscar y actualizar documento de la base de datos
                    User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdate) => {

                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'error al actualizar usuario'
                            });
                        }

                        if (!userUpdate) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'no se a actualizado el usuario'
                            });
                        }

                        //devolver una respuesta
                        return res.status(200).send({
                            status: 'success',
                            user: userUpdate
                        });
                    });
                }
            });
        } else {

            //Buscar y actualizar documento de la base de datos
            User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdate) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'error al actualizar usuario'
                    });
                }

                if (!userUpdate) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'no se a actualizado el usuario'
                    });
                }

                //devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdate
                });
            });
        }
    },

    uploadAvatar: function(req, res) {

        let userId = req.user.sub;
        let file = req.file;

        if (!file) {
            return res.status(404).send({
                status: "error",
                message: "Avatar no subido...",
            });
        }

        User.findOneAndUpdate({ _id: userId }, { image: file.filename }, { new: true },
            (err, userUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error al actualizar el avatar del usuario",
                    });
                }

                if (!userUpdated) {
                    return res.status(404).send({
                        status: "error",
                        message: "No se a actualizado el avatar del usuario",
                    });
                }

                return res.status(200).send({
                    status: "success",
                    message: "Avatar upload",
                    user: userUpdated,
                });
            }
        );

    },

    avatar: function(req, res) {
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/' + fileName;

        fs.exists(pathFile, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(pathFile));
            } else {
                return res.status(404).send({
                    message: 'La imagen no existe'
                });
            }
        });
    },

    getUsers: function(req, res) {
        User.find().exec((err, users) => {
            if (err || !users) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    users
                });
            }
        });
    },

    getUser: function(req, res) {
        var userId = req.params.userId;
        User.findById(userId).exec((err, user) => {
            if (err || !user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No Existe el usuario'
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    user
                });
            }
        });
    }

};

module.exports = controller;