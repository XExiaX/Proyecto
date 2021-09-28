var oracledb = require('oracledb');
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
var constantes = require('../util/constantes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

module.exports = function () {
    return function (req, res) {
        oracledb.getConnection(constantes.dbPMMC,
            function myFunc(err, connection) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                var actualizarUsuario = {
                    P_IDUSUARIO: req.body.idUsuario,
                    P_NOMBRE: req.body.nombreUsuario,
                    P_APELLIDO: req.body.apellidoUsuario,
                    
                    P_RESULT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                    P_MSG: { type: oracledb.STRING, dir: oracledb.BIND_INOUT }
                };
                console.log(actualizarUsuario)
                /*var loginError = {
                    codeError: 1,
                    messageError: "Cliente no registrado",
                    messageDetail: "Oralce no data found exception. Table: EINTERFACE.CLIENTES. idCliente " + req.body.idcliente
                };*/
                connection.execute(
                    //`BEGIN APP_PKG_APP.SP_LOGIN(:P_IDCLIENTE, :P_NOMCLIENTE, :P_RESULT, :P_MSG, :P_MSGDTL); END;`,
                    `CALL EINTERFACE.APP_PKG_APP.SP_UPD_USUARIO(:P_IDUSUARIO, :P_NOMBRE, :P_APELLIDO,:P_RESULT, :P_MSG)`,
                    actualizarUsuario,
                    {
                        maxRows: 1
                    },
                    function (err, result) {
                        console.error(result);
                        if (err) {
                            console.error(err.message);
                            doRelease(connection);
                            res.send(404, err.message)
                            return;
                        }
                        if (result.outBinds.P_RESULT===200) {
                            res.send(200, JSON.stringify(result.outBinds.P_MSG))
                        }
                        else {
                            res.send(404, JSON.stringify(result.outBinds.P_MSG))
                        }
                        doRelease(connection);
                        function doRelease(connection) {
                            connection.close(
                                function (err) {
                                    if (err) {
                                        console.error(err.message);
                                    }
                                })
                        }
                    });
            });

    }
}




