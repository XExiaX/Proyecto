var oracledb = require('oracledb');
var mysql = require('async-mysql');
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
var constantes = require('../util/constantes');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

module.exports = function () {
    return function (req, res) {
        oracledb.getConnection(constantes.dbPUC,
            function myFunc(err, connection) {
                if (err) {
                    console.error(err.message);
                    return;
                }

                var loginEntrada = {
                    I_TIP_DOCUMENTO: req.body.I_TIP_DOCUMENTO,
                    I_NUM_DOCUMENTO: req.body.I_NUM_DOCUMENTO,
                };
                var result = 0


                connection.execute(
                    //`BEGIN APP_PKG_APP.SP_LOGIN(:P_IDCLIENTE, :P_NOMCLIENTE, :P_RESULT, :P_MSG, :P_MSGDTL); END;`,
                    //`CALL EPUC.PUC_PKG_CLUB_VEA.FN_GET_CODINTERNO(:I_TIP_DOCUMENTO, :I_NUM_DOCUMENTO)`,
                    `select EPUC.PUC_PKG_CLUB_VEA.FN_GET_CODINTERNO (:I_TIP_DOCUMENTO, :I_NUM_DOCUMENTO) from dual`,
                    loginEntrada,

                    async function (err, result) {
                        if (err) {
                            console.error(err.message);
                            //                            doRelease(connection);
                            res.send(404, err.message)
                            return;
                        }
                        resultado = result.rows[0][0]
                        console.log(result.rows[0][0])
                        var salidaE ={
                            O_COD_MENSAJE: 1,
                            O_DET_MENSAJE: "CLIENTE NO REALIZÓ COMPRAS EN LOS ÚLTIMOS 3 MESES"
                        }
                        //if (resultado==="NO EXISTE") {
                        if (resultado > 0) {
                            let connection = await mysql.connect(
                                constantes.dbappSPSAC
                            );
                            //resultado = 1772566;
                            const rows = await connection.query(`
                            select 
                            FECHA as MES_CONSUMO,
                            CODIGO_SECCION as COD_SECCION,
                            NOMBRE_SECCION as NOM_SECCION ,
                            MONTO_TOTAL as NOM_CONSUMO 
                            from consumo_clientes_vivanda where codigo_interno =` + resultado);
                            salida = {
                                O_CURSOR: rows,
                                O_COD_MENSAJE: 0,
                                O_DET_MENSAJE: "OK"
                            }
                            if (rows.length > 0) {
                                console.log("LLENO")
                                res.send(200, (salida))
                            }
                            else {
                                console.log(salida)
                               
                                res.send(404, salidaE)
                            }
                        } else {
                            //console.log(salida)
                            res.send(404, salidaE)
                        }
                    });
            });

    }
}




