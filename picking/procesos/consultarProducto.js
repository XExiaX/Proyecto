var oracledb = require('oracledb');
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
var constantes = require('../util/constantes');
var fs = require('fs');

oracledb.fetchAsBuffer = [ oracledb.BLOB ];
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));

module.exports = function (){
  return function (req, res) {
    oracledb.getConnection(constantes.dbPMMC,
    function myFunc(err, connection) {
      if (err) {
        console.error(err.message);
        return;
      }
      var consultarProductoEntrada = {
        P_ID_TIENDA:  req.body.idTienda,  // Bind type is determined from the data.  Default direction is BIND_IN
        P_PRD_LVL_NUMBER: req.body.barcode,
        P_IDTIENDA:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        P_NOMPRODUCTO: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        P_PRICE:  { type: oracledb.DEFAULT, dir: oracledb.BIND_OUT },
        P_IMG: { type: oracledb.BUFFER, dir: oracledb.BIND_OUT, maxSize: 1000000000 },
        P_UNIDAD_MEDIDA:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        P_RESULT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        P_MSG:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        P_MSGDTL:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      var consultarProductoError = {
        codeError:  1, 
        messageError: "Producto no identificado",
        messageDetail:  "Oralce no data found exception. Table: EINTERFACE.PRODUCTOS. barcode "+req.body.barcode
      };  
      connection.execute(
        "ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '. '",
        function (err, result) {
            if (err) {
                console.error(err.message);
                return;
            }
          }
        )
      connection.execute(
        //`BEGIN APP_PKG_APP.SP_LOGIN(:P_IDCLIENTE, :P_NOMCLIENTE, :P_RESULT, :P_MSG, :P_MSGDTL); END;`,
        `CALL APP_PKG_APP.SP_GET_PRODUCTO(:P_ID_TIENDA, :P_PRD_LVL_NUMBER, :P_IDTIENDA, :P_NOMPRODUCTO, :P_PRICE,
                                          :P_IMG, :P_UNIDAD_MEDIDA, :P_RESULT, :P_MSG, :P_MSGDTL)`,
        consultarProductoEntrada,
        { maxRows: 1
        },
        function(err, result) {
          if (err) {
            console.error(err.message);
            doRelease(connection);
            res.send(404,err.message )
            return;
          }
          doRelease(connection);
          function doRelease(connection) {
            connection.close(
              function(err) {
                if (err) {
                  console.error(err.message);
                }
              })}      
              /*/
              fs.readFile(image_origial, function(err, original_data){
              fs.writeFile('image_orig.jpg', original_data, function(err) {});
              var base64Image = original_data.toString('base64');
              var decodedImage = new Buffer(base64Image, 'base64');
              fs.writeFile('image_decoded.jpg', decodedImage, function(err) {});
          });
              */
          if(result.outBinds.P_RESULT<1){
           var base64Image = result.outBinds.P_IMG.toString('base64');
           var decodedImage = new Buffer(base64Image, 'base64');
                       
           //var buff = new Buffer(result.outBinds.P_IMG,'binary').toString('base64');          
           var consultarProductoSalida = {
            idTienda:  result.outBinds.P_IDTIENDA, 
            nomProducto: result.outBinds.P_NOMPRODUCTO,
            unidadMedida:result.outBinds.P_UNIDAD_MEDIDA,
            price:  result.outBinds.P_PRICE,
            imagen:  base64Image
          };
          res.send(200,JSON.stringify(consultarProductoSalida))
         /* fs.writeFile('temp4.jpeg',decodedImage,(err)=>{
            if(err) throw err;
            console.log("jaja")
          })*/
          }
          else {
            res.send(404,consultarProductoError)
          }
        });  
    }); 
  }
}


  