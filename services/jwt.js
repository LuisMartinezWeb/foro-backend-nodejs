'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

exports.createToken = function(user) {

    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    }

    return jwt.encode(payload, 'alfa-tango--secretapara-token123344333423442424313342342342432423');

};