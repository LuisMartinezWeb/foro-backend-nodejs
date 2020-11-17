'use strict'

var validator = require('validator');
var Topic = require('../models/topic');


var controller = {
    test: function(req, res) {
        return res.status(200).send({
            message: 'hola que tal'
        });
    },

    save: function(req, res) {

        //recoger los parametros por post
        var params = req.body;

        //validar los datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);;
            var validate_lang = !validator.isEmpty(params.lang);;

        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }
        if (validate_content && validate_title && validate_lang) {
            //crear objeto a guardar
            var topic = new Topic();
            //asignarle valores 

            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;

            //guardar el topic
            topic.save((err, topicStored) => {
                //devolver una respuesta
                if (err || !topicStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tema no se a guardado'
                    });
                } else {
                    return res.status(200).send({
                        status: 'success',
                        topic: topicStored
                    });
                }

            });


        } else {
            return res.status(200).send({
                messaje: 'Los datos no son validos'
            });
        }

    },

    getTopics: function(req, res) {
        //cargar la libreria de paginacion en la clase(modelo topic)

        //recoger la pagina actual
        if (!req.params.page || req.params.page == null || req.params.page == 0 || req.params.page == "0" || req.params.page == undefined) {
            var page = 1;
        } else {
            var page = parseInt(req.params.page);
        }


        //Indicar las opciones de paginacion

        var options = {
            sort: { date: -1 },
            populate: 'user',
            limit: 5,
            page: page

        };
        //Hacer el find paginado

        Topic.paginate({}, options, (err, topics) => {

            if (err) {
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error al hacer la consulta'
                });
            }

            if (!topics) {
                return res.status(404).send({
                    status: 'Error',
                    message: 'No Hay Topics'
                });
            }

            //Devolver resultado (topics, total de topics, total de paginas)
            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });


    },

    getTopicsByUser: function(req, res) {

        //Conseguir el id del usuario
        var userId = req.params.user;

        //Find con una condicion de usuario

        Topic.find({
            user: userId
        }).sort([
            ['date', 'descending']
        ]).exec((err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Erro en la peticion'
                });
            }
            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas para mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                topics
            });
        });
        //Devolver un resultado

    },

    getTopic: function(req, res) {

        //sacar el id del topic de la url
        var topicId = req.params.id;

        //find por id del topic
        Topic.findById(topicId).populate('user').populate('comments.user').exec((err, topic) => {
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

            return res.status(200).send({
                status: 'success',
                topic

            });
        });

    },

    update: function(req, res) {
        //recoger el id del topic de la url
        var topicId = req.params.id;

        //recoger los datos que llegan desde post
        var params = req.body;

        //validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);;
            var validate_lang = !validator.isEmpty(params.lang);;

        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_content && validate_title && validate_lang) {
            //Montar un json con los datos modificables
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            };
            //Find and Update del topic por id y por id de usuario
            Topic.findOneAndUpdate({ _id: topicId, user: req.user.sub }, update, { new: true }, (err, topicUpdate) => {
                //devolver respuesta
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'error en la peticion'

                    });
                }

                if (!topicUpdate) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se ah actualizado el tema'

                    });
                }

                return res.status(200).send({
                    status: 'success',
                    topic: topicUpdate

                });
            });

        } else {
            return res.status(500).send({
                message: 'Los datos no son correctos',


            });
        }



    },

    delete: function(req, res) {
        //sacar el id del topic de la url
        var topicId = req.params.id;

        //find and delete por topicId y por userId
        Topic.findOneAndDelete({ _id: topicId, user: req.user.sub }, (err, topicRemove) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'error en la peticion'

                });
            }

            if (!topicRemove) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ah podido borrar el tema'

                });
            }
            //devolver una respuesta
            return res.status(200).send({
                status: 'success',
                topic: topicRemove
            });
        });


    },

    search: function(req, res) {

        //sacar el string a buscar de la url
        var searchString = req.params.search;

        //Find or
        Topic.find({
                "$or": [
                    { "title": { "$regex": searchString, "$options": "i" } },
                    { "content": { "$regex": searchString, "$options": "i" } },
                    { "lang": { "$regex": searchString, "$options": "i" } },
                    { "code": { "$regex": searchString, "$options": "i" } }
                ]
            }).populate('user')
            .sort([
                ['date', 'descending']
            ])
            .exec((err, topics) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la peticion'

                    });
                }

                if (!topics) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'Hoy hay temas disponibles'

                    });
                }

                return res.status(200).send({
                    status: 'success',
                    topics

                });
            });



    }
};

module.exports = controller;