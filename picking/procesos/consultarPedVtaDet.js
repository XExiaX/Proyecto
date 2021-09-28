var oracledb = require('oracledb');
//var dbConfig = require('./dbconfig.js');
//var dbConfig2 = require('./dbconfig2.js');
const express = require('express');
var bodyParser = require('body-parser');
const port = process.env.port || 3001
const app = express();
var constantes = require('../util/constantes');

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));

module.exports = function (){
  return function (req, res) {
    if(req.body.idTipo<1){
      console.log("0")
    oracledb.getConnection(
      constantes.dbCT2C,
    
    function myFunc(err, connection) {
      if (err) {
        console.error(err.message);
        return;
      }
      
      var bindvars = {
          
        P_ID_TIENDA:  req.body.idTienda, 
        P_ID_CLIENTE: req.body.idCliente,
        P_FECHA: req.body.fecha,
        P_CAJA: req.body.caja,
        P_SECUENCIA: req.body.secuencia,
        P_IDCN: req.body.idCN,
        IO_CURSOR: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        P_RESULT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        P_MSG:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        P_MSGDTL:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      var error = {
        codeError:  1, 
        messageError: "Producto no identificado",
        messageDetail:  "Oralce no data found exception. Table: EINTERFACE.PRODUCTOS. idCliente "+req.body.number
      };
      connection.execute(
        `CALL PKG_ICT2_APP.SP_GET_VTAHISTO_DET(:P_ID_TIENDA, :P_ID_CLIENTE, :P_FECHA, :P_CAJA, :P_SECUENCIA, :P_IDCN,
                                          :IO_CURSOR, :P_RESULT, :P_MSG, :P_MSGDTL)`,
        bindvars,
        { maxRows: 1
        },
        function(err, result) {
          if (err) {
            console.error(err.message);
            doRelease(connection);
            res.send(404,err.message )
            return;
          }
         
           //   res.send(200,result.outBinds)
          if(result.outBinds.P_RESULT===0){
            res.send(200,JSON.stringify(result.outBinds))
            console.log("A");
          }
          else {
            res.send(404,error)
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
}
else{
  console.log("1")
    oracledb.getConnection(
      constantes.dbPMMC,
        function myFunc(err, connection) {
          if (err) {
            console.error(err.message);
            return;
          }
          var bindvars = {
            P_ID_TIENDA:  req.body.idTienda, 
        P_ID_CLIENTE: req.body.idCliente,
        P_IDCN: req.body.idCN,
        IO_CURSOR: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        P_RESULT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        P_MSG:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        P_MSGDTL:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }


          };
          var error = {
            codeError:  1, 
            messageError: "Producto no identificado",
            messageDetail:  "Oralce no data found exception. Table: EINTERFACE.PRODUCTOS. idCliente "+req.body.number
          };
          connection.execute(
            //`BEGIN APP_PKG_APP.SP_GET_VTAHISTO_CAB(:P_IDCLIENTE, :P_NOMCLIENTE, :P_RESULT, :P_MSG, :P_MSGDTL); END;`,
            `CALL APP_PKG_APP.SP_GET_PEDIDO_DET(:P_ID_TIENDA, :P_ID_CLIENTE, :P_IDCN,
                                              :IO_CURSOR, :P_RESULT, :P_MSG, :P_MSGDTL)`,
            bindvars,
            { maxRows: 1
            },
            function(err, result) {
              if (err) {
                console.error(err.message);
                doRelease(connection);
                res.send(404,err.message )
                return;
              }
                 
                    
              if(result.outBinds.P_RESULT===0){
                res.send(200,JSON.stringify(result.outBinds))
                console.log("B");
                console.log(result.outBinds.IO_CURSOR);
              }
              else {
                res.send(404,error)
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
        })

}
}};



  
