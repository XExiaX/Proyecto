var soap = require('strong-soap').soap;
module.exports = {
    createClient : (url, options) => {
        return new Promise((resolve, reject)=>{
            soap.createClient(url, options, function(err, client){
                if(err) return reject(err);
                resolve(client)
            }) 
        })
    },
    /*method : (requestArgs) => {
        return new Promise((resolve, reject) => {
            method(requestArgs, function (err, result, envelope, soapHeader) {
                if(err) return reject(err);
                resolve(result, envelope, soapHeader)
            });
        })
    },*/
    consultar : (metodo,requestArgs) => {
        //console.log("entro a method2")
        return new Promise((resolve, reject) => {
            //console.log("entro a method2, antes de method1")
            metodo(requestArgs, function (err, result, envelope, soapHeader) {
                //console.log("entro a method2, antes de if")
                if(err) return reject(err);
                resolve(result, envelope, soapHeader)
            });
        })
    }
}
