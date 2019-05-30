
var evnironments = {

};

evnironments.staging = {
    'httpPort': 4000,
    'httpsPort': 4001,
    'envName': 'staging',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 5
}; 
 
evnironments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret' : 'thisIsAlsoASecret',
    'maxChecks' : 5
};

var selectedEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(evnironments[selectedEnvironment]) == 'object' ? evnironments[selectedEnvironment] : evnironments.staging;

module.exports = environmentToExport;
