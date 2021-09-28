var oracledb = require('oracledb');
//var dbConfig = require('./dbconfig.js');
const express = require('express');
var bodyParser = require('body-parser');
var constantes = require('../util/constantes');
const port = process.env.port || 3001
const app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));
oracledb.poolTimeout = 20;

module.exports = function (){
  return function (req, res) {
  oracledb.getConnection(constantes.dbPMMC,
    function myFunc(err, connection) {
      if (err) {
        console.error(err.message);
        return;
      }
      var consultarPedidoCabEntrada = {
        P_ID_TIENDA:  req.body.idTienda,  
        P_ID_CLIENTE: req.body.idCliente,
        P_ESTADO: req.body.estado,
        P_IDCN: req.body.idCN,
        IO_CURSOR: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        P_RESULT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        P_MSG:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        P_MSGDTL:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        
      };
      var consultarPedidoCabError = {
        codeError:  1, 
        messageError: "Pedido no encontrado",
        messageDetail:  "Oralce no data found exception. Table: EINTERFACE.APP_ORDER_CAB. OP "+req.body.number
      };
      connection.execute(
        //`BEGIN APP_PKG_APP.SP_LOGIN(:P_IDCLIENTE, :P_NOMCLIENTE, :P_RESULT, :P_MSG, :P_MSGDTL); END;`,
        `CALL APP_PKG_APP.SP_GET_PEDIDO_CAB(:P_ID_TIENDA, :P_ID_CLIENTE, :P_ESTADO, :P_IDCN,
                                          :IO_CURSOR, :P_RESULT, :P_MSG, :P_MSGDTL)`,
        consultarPedidoCabEntrada,
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
                
          if(result.outBinds.P_RESULT===0){
            res.send(200,JSON.stringify(result.outBinds))
          }
          else {
            res.send(404,JSON.stringify(consultarPedidoCabError))
          }
        });
    }); 
}};

  