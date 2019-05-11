var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');


var lib = {

};



lib.baseDir = path.join(__dirname, '/../.data');

lib.create = (dir, file, data, callback) => {

    fs.open(lib.baseDir + '/' + dir+ '/' +file + '.json', 'wx', (err, fileDesc) => {
        if (!err && fileDesc) {
            var stringData = JSON.stringify(data);

            fs.writeFile(fileDesc, stringData, (err) => {
                if (!err) {
                    fs.close(fileDesc, (err) => {
                        if (!err) {
                            callback(false);
                        }
                        else {
                            callback('error closing the new file');
                        }
                    })
                }
                else {
                    callback('Error writing to the new file');
                }
            })
        }
        else {
            callback('The file already exists');
        }
    })



}

lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir + '/' + dir + '/' + file + '.json', 'utf8', (err, data) => {
        if(!err && data) 
        {
            var dataParsed = helpers.parseJsonToObject(data);
            callback(false, dataParsed);
        }
        else
        {
            callback(err, data);
        }
        


    })
}


lib.update = (dir, file, data, callback) => {



    fs.open(lib.baseDir + '/' + dir + '/' + file + '.json', 'r+', (err, fileDesc) => {
        if (!err && fileDesc) {
            var stringData = JSON.stringify(data);
            fs.truncate(fileDesc, (err) => {
                if (!err) {
                    fs.writeFile(fileDesc, stringData, (err) => {
                        if (!err) {
                            callback(false);

                        }
                        else {
                            callback('error updating the file');
                        }
                    })
                }
                else {
                    callback('Error truncating file');
                }
            })
        }
        else {
            callback('Error opening file, file may not exist');
        }
    })
}

lib.delete = (dir, file, callback) => {
    fs.unlink(lib.baseDir + '/' +dir + '/'+ file + '.json', (err) => {
        if (!err) {
            callback(false);
        }
        else {
            callback('erro deleting the file');
        }
    })
}

module.exports = lib;