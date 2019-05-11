var http = require('http');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var https = require('https');
var fs = require('fs');
var helpers = require('./lib/helpers');

var data = require('./lib/data');
var handlers = require('./lib/handlers');

// data.delete('test', 'newFile', (err) =>{
//     console.log('this is the error '+err);
// });

var httpServer = http.createServer((req, res) => {
   unifiedFunction(req,res);

});

httpServer.listen(config.httpPort, () => {
    console.log("Server is listening on the port " , config.httpPort +" with environment " , config.envName);
});

var httpsServerOptions ={
'key' : fs.readFileSync('./https/key.pem'),
'cert' : fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions,(req, res) => {
    unifiedFunction(req,res);
 
 });
 
 httpsServer.listen(config.httpsPort, () => {
     console.log("Server is listening on the port " , config.httpsPort +" with environment " , config.envName);
 })
var unifiedFunction = function(req,res) {
    var parserUrl = url.parse(req.url, true);
    var path = parserUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    var queryStringObject = parserUrl.query;
    var method = req.method.toLowerCase();
    var headers = req.headers;
    var decoder = new stringDecoder('utf-8');
    var buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    })
    req.on('end', () => {
        buffer += decoder.end();
        var chosenHandler = typeof(router[trimmedPath])!= 'undefined'? router[trimmedPath] : handlers.notFound ;
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        chosenHandler(data, function (statusCode, payLoad)  {
             statusCode = typeof(statusCode) == 'number'? statusCode : 200;
             
             payLoad = typeof(payLoad) == 'object'? payLoad: {};
            var payLoadString = JSON.stringify(payLoad);
            res.setHeader('content-type', 'application/json');
            res.writeHead(statusCode);
            res.end(payLoadString);
           // console.log("Parsed url is " + trimmedPath + ' with method ' + method + ' with query ', queryStringObject ,
           // ' with headers ', headers , ' with payload ' + buffer);
           //console.log("Returned route is ",statusCode, payLoad);
        });
        
        
    })
};

var router = {
    'users': handlers.users,
    'ping': handlers.ping,
    'tokens': handlers.tokens
};
