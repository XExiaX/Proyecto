var oracledb = require('oracledb');
//var dbConfig = require('./dbconfig2.js');
const express = require('express');
var bodyParser = require('body-parser');
var constantes = require('../util/constantes');


const app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));
oracledb.poolTimeout = 20;

module.exports = function (){
  return function (req, res) {
  oracledb.getConnection(
    constantes.dbCT2C,
    function myFunc(err, connection) {
      if (err) {
        console.error(err.message);
        return;
      }
      var consultarVtaHistoCabEntrada = {
        P_ID_TIENDA:  req.body.idtienda,  // Bind type is determined from the data.  Default direction is BIND_IN
        P_ID_CLIENTE: req.body.idcliente,
        P_FECHAINICIO: req.body.fechainicio,
        P_FECHAFIN: req.body.fechafin,
        P_IDTIPO: req.body.idtipo,
        IO_CURSOR: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        P_RESULT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        P_MSG:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        P_MSGDTL:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      var consultarVtaHistoCabError = {
        codeError:  1, 
        messageError: "Ventas no encontradas",
        messageDetail:  "Oralce no data found exception. Table: ECT2SP.CTX_HEADER_TRX. idCliente "+req.body.idcliente
      };
      connection.execute(
        //`BEGIN APP_PKG_APP.SP_GET_VTAHISTO_CAB(:P_IDCLIENTE, :P_NOMCLIENTE, :P_RESULT, :P_MSG, :P_MSGDTL); END;`,
        `CALL PKG_ICT2_APP.SP_GET_VTAHISTO_CAB(:P_ID_TIENDA, :P_ID_CLIENTE, :P_FECHAINICIO, :P_FECHAFIN, :P_IDTIPO,
                                          :IO_CURSOR, :P_RESULT, :P_MSG, :P_MSGDTL)`,
        consultarVtaHistoCabEntrada,
        { maxRows: 1
        },
        function(err, result) {
          if (err) {
            console.error(err.message);
            doRelease(connection);
            res.send(404,err.message )
            return;
          }
          var consultarVtaHistoCabRes = {
            idTienda:  req.body.idtienda, 
            idCliente: req.body.idcliente,
            XX: result.outBinds.IO_CURSOR.metaData
          };
          result.outBinds.IO_CURSOR.getRows(1, function (err, rows){
            if(err) {
              console.log(err)
            } 
         //   console.log(rows[0][1])
          })
         

             // res.send(200,result.outBinds)
          if(result.outBinds.P_RESULT===0){

            
            //res.send(200,JSON.stringify(consultarVtaHistoCabRes))
            res.send(200,JSON.stringify(consultarVtaHistoCabRes))
          }
          else {
            res.send(404,consultarVtaHistoCabError)
          }
          doRelease(connection);
          function doRelease(connection) {
            connection.close(
              function(err) {
                if (err) {
                  console.error(err.message);
                }
              })}   
        });
    }); 
}};


  
