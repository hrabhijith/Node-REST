
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config')

var handlers = {};

handlers.users = (data, callback) => {
    var acceptableRoutes = ['get', 'post', 'put', 'delete'];

    if (acceptableRoutes.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    }
    else {
        callback(405);
    }
}

handlers._users = {};

handlers._users.post = (data, callback) => {

    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        _data.read('users', phone, (err, data) => {
            if (err) {
                var hashPassword = helpers.hash(password);
                if (hashPassword) {
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashPassword': hashPassword,
                        'tosAgreement': true
                    };

                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        }
                        else {
                            console.log(err);
                            callback(500, { 'error': 'error creating new user' });
                        }
                    });

                }
                else {
                    callback(500, { 'error': 'unable to hash password' });
                }
            }
            else {
                callback(400, { 'error': 'A user already exists with this phone number' });
            }
        })
    }
    else {
        callback(400, { 'error': 'missing required fields' });
    }



}


handlers._users.put = (data, callback) => {
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone) {
        if (firstName || lastName || password) {
            var token = typeof (data.headers.token) == 'string' && data.headers.token.trim() == 20 ? data.headers.token.trim() : false;

            handlers._tokens.verify(token, phone, (isValid) => {
                if (isValid) {
                    _data.read('users', phone, (err, userObject) => {
                        if (!err && userObject) {
                            if (firstName) {
                                userObject.firstName = firstName;
                            }
                            if (lastName) {
                                userObject.lastName = lastName;
                            }
                            if (password) {
                                userObject.password = password;
                            }

                            _data.update('users', phone, userObject, (err) => {
                                if (!err) {
                                    callback(200);
                                }
                                else {
                                    console.log(err);
                                    callback(500, { 'error': 'Cound not update the object' });
                                }
                            })
                        }
                        else {
                            callback(400, { 'error': 'Specified user doesn\'t exist' });
                        }
                    })
                }
                else {
                    callback(403, { 'error': 'Missing required token in header or token is invalid' });
                }
            });
        }




        else {
            callback(400, { 'error': 'Missing fields to update' });
        }

    }
    else {
        callback(400, { 'error': 'Missing required fields' });
    }

}

handlers._users.get = (data, callback) => {
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false;


    if (phone) {
        var token = typeof (data.headers.token) == 'string' && data.headers.token.trim() == 20 ? data.headers.token.trim() : false;

        handlers._tokens.verify(token, phone, (isValid) => {
            if (isValid) {
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        delete data.hashPassword;
                        callback(200, data);
                    }
                    else {
                        callback(404);
                    }
                })
            }
            else {
                callback(403, { 'error': 'Missing required token in header or token is invalid' });
            }
        })

    }
    else {
        callback(400, { 'error': 'Missing required fields' });
    }
}

handlers._users.delete = (data, callback) => {
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false;

    if (phone) {

        var token = typeof (data.headers.token) == 'string' && data.headers.token.trim() == 20 ? data.headers.token.trim() : false;

        handlers._tokens.verify(token, phone, (isValid) => {
            if (isValid) {
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                callback(200);
                            }
                            else {
                                callback(500, { 'error': 'Could not delete the specified user' });
                            }
                        })
                    }
                    else {
                        callback(400, { 'error': 'Could not find the specified user' });
                    }
                })
            }
            else {
                callback(403, { 'error': 'Missing required token in header or token is invalid' });
            }
        });

    }
    else {
        callback(400, { 'error': 'Missing required fields' });
    }
}

handlers.tokens = (data, callback) => {
    var acceptableRoutes = ['get', 'post', 'put', 'delete'];

    if (acceptableRoutes.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    }
    else {
        callback(405);
    }
}

handlers._tokens = {

};

handlers._tokens.post = (data, callback) => {
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {
        _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                var hashPassword = helpers.hash(password);
                if (hashPassword == userData.hashPassword) {
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    _data.create('tokens', tokenId, tokenObject, (err) => {

                        if (!err) {
                            callback(200, tokenObject);
                        }
                        else {
                            callback(500, { 'error': 'Could not create the new token' });
                        }
                    })
                }
                else {
                    callback(400, { 'error': 'password did not match with the stored user\'s password' });
                }
            }
            else {
                callback(400, { 'error': 'Could not find the specified user' });
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing Required fields' });
    }
}

handlers._tokens.get = (data, callback) => {

    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id : false;

    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {

                callback(200, tokenData);
            }
            else {
                callback(404);
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing required fields' });
    }


}

handlers._tokens.put = (data, callback) => {
    var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    var extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if (id && extend) {

        _data.read('tokens', id, (err, userObject) => {
            if (!err && userObject) {
                if (userObject.expires > Date.now()) {
                    userObject.expires = Date.now() + 1000 * 60 * 60;
                    _data.update('tokens', id, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        }
                        else {
                            console.log(err);
                            callback(500, { 'error': 'Cound not update the token' });
                        }
                    })
                }
                else {
                    callback(400, { 'error': 'token has already expired and cannot be extended' })
                }
            }
            else {
                callback(400, { 'error': 'Specified token doesn\'t exist' });
            }
        })


    }
    else {
        callback(400, { 'error': 'Missing required fields' });
    }

}

handlers._tokens.delete = (data, callback) => {

    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id : false;

    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200);
                    }
                    else {
                        callback(500, { 'error': 'Could not delete the specified token' });
                    }
                })
            }
            else {
                callback(400, { 'error': 'Could not find the specified token' });
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing required fields' });
    }

}

handlers._tokens.verify = (tokenId, phone, callback) => {
    _data.read('tokens', tokenId, (err, tokenData) => {
        if (!err && tokenData) {
            if (tokenData.phone == phone) {
                callback(true);
            }
            else {
                callback(false);
            }
        }
        else {
            callback(false);
        }
    })
};

// checks
handlers.checks = (data, callback) => {
    var acceptableRoutes = ['get', 'post', 'put', 'delete'];

    if (acceptableRoutes.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    }
    else {
        callback(405);
    }
}

// Container for the checks
handlers._checks = {

};

handlers._checks.post = function (data, callback) {
    var protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof (data.payload.method) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 & data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        _data.read('tokens', token, function(err, tokenData){
            if(!err && tokenData){
                var phone = tokenData.phone;
                _data.read('users', phone, function(err, userData){
                    if (!err && userData){
                        var checks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        if (checks.length < config.maxChecks){

                        }
                        else
                        {
                            callback(400 , { 'error' : 'User already has maximum number of checks ("'+ config.maxChecks +')"'});
                        }
                    }
                    else{
                        callback(403)
                    }
                })
            }
            else{
                callback(403, {'error': 'Unauthorized'});
            }
        })

    }

    else {
        callback(400, { 'error': 'Missing input parameters or invalid' });
    }
}






handlers.ping = (data, callback) => {
    callback(200, { 'success': 'Service is working fine' });
}

module.exports = handlers;