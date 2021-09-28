var oracledb = require('oracledb');
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
var constantes = require('../util/constantes');

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
        var loginEntrada = {
          P_IDCLIENTE:  req.body.idCliente,  
          P_NOMCLIENTE: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
          P_RESULT:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          P_MSG: { type: oracledb.STRING, dir: oracledb.BIND_INOUT },
          P_MSGDTL:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        };
        var loginError = {
          codeError:  1, 
          messageError: "Cliente no registrado",
          messageDetail:  "Oralce no data found exception. Table: EINTERFACE.CLIENTES. idCliente "+req.body.idcliente
        };
        connection.execute(
          //`BEGIN APP_PKG_APP.SP_LOGIN(:P_IDCLIENTE, :P_NOMCLIENTE, :P_RESULT, :P_MSG, :P_MSGDTL); END;`,
          `CALL APP_PKG_APP.SP_LOGIN(:P_IDCLIENTE, :P_NOMCLIENTE, :P_RESULT, :P_MSG, :P_MSGDTL)`,
          loginEntrada,
          { maxRows: 1
          },
          function(err, result) {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              res.send(404,err.message )
              return;
            }
            if(result.outBinds.P_NOMCLIENTE){
              res.send(200,JSON.stringify(result.outBinds.P_NOMCLIENTE))  
            }
            else {
              res.send(404,JSON.stringify(loginError))        
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
}




  