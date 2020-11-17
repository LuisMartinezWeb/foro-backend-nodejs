'use strict'
var Topic = require('../models/topic');
var validator = require('validator');

var controller = {
    add: function(req, res) {
        //Recoger el id del topic de la url
        var topicId = req.params.topicId;

        //Find por id del topic
        Topic.findById(topicId).exec((err, topic) => {
            if (err) {
                return res.status(200).send({
                    status: 'Error',
                    message: 'Error en la peticion'
                });
            }

            if (!topic) {
                return res.status(404).send({
                    status: 'Error',
                    message: 'No existe el tema'
                });
            }
            //Comprobar si el usuario esta identificado y validar datos
            if (req.body.content) {
                //validar los datos
                try {
                    var validate_content = !validator.isEmpty(req.body.content);;
                } catch (err) {
                    return res.status(200).send({
                        message: 'No has comentado nada'
                    });
                }
                if (validate_content) {
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content,

                    };
                    //En la propiedad comments del objeto resultante hacer un push
                    topic.comments.push(comment);
                    //Guarda el topic completo
                    topic.save((err) => {
                        if (err) {
                            return res.status(200).send({
                                status: 'Error',
                                message: 'Error al guardar el comentario'
                            });
                        }

                        //populate
                        Topic.findById(topic._id).populate('user').populate('comments.user').exec((err, topic) => {
                            //devolver el resultado
                            if (err) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'Error en la peticion'

                                });
                            }

                            if (!topic) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'No existen topics'

                                });
                            }

                            //Devolver una respuesta
                            return res.status(200).send({
                                status: 'success',
                                topic

                            });
                        });
                    });


                } else {
                    return res.status(200).send({
                        message: 'El comentario no es valido'
                    });
                }
            }


        });


    },

    update: function(req, res) {
        //conseguir el id del comentario de la url
        var commentId = req.params.commentId;
        //recoger datos y validar
        var params = req.body;
        //validar los datos
        try {
            var validate_content = !validator.isEmpty(params.content);;
        } catch (err) {
            return res.status(200).send({
                message: 'No has comentado nada'
            });
        }

        if (validate_content) {
            //find and update de subdcumento de comentario
            Topic.findOneAndUpdate({ "comments._id": commentId }, {
                    "$set": {
                        "comments.$.content": params.content
                    }
                }, { new: true },
                (err, topicUpdate) => {
                    if (err) {
                        return res.status(200).send({
                            status: 'Error',
                            message: 'Error al actualizar el comentario'
                        });
                    }

                    if (!topicUpdate) {
                        return res.status(404).send({
                            status: 'Error',
                            message: 'No existe el tema'
                        });
                    }

                    //devolver los datos

                    return res.status(200).send({
                        status: 'success',
                        topic: topicUpdate
                    });
                }
            );

        }

    },

    delete: function(req, res) {
        //sacar el id del topic y del comentario
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;
        //Buscar el topic

        Topic.findById(topicId, (err, topic) => {

            if (err) {
                return res.status(200).send({
                    status: 'Error',
                    message: 'Error al actualizar el comentario'
                });
            }

            if (!topic) {
                return res.status(404).send({
                    status: 'Error',
                    message: 'No existe el tema'
                });
            }
            //seleccionar el subdocumento(comentario)
            var comment = topic.comments.id(commentId);

            //borrar el comentario
            if (comment) {
                comment.remove();

                //guardar el topic
                topic.save((err) => {
                    if (err) {
                        return res.status(200).send({
                            status: 'Error',
                            message: 'Error al actualizar el comentario'
                        });
                    }
                    //populate
                    Topic.findById(topic._id).populate('user').populate('comments.user').exec((err, topic) => {
                        //devolver el resultado
                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error en la peticion'

                            });
                        }

                        if (!topic) {
                            return res.status(404).send({
                                status: 'error',
                                message: 'No existen topics'

                            });
                        }

                        //Devolver una respuesta
                        return res.status(200).send({
                            status: 'success',
                            topic

                        });
                    });
                });

            } else {
                return res.status(404).send({
                    status: 'Error',
                    message: 'No existe el Comentario'
                });
            }

        });

    }

};
module.exports = controller;