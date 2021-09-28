"use strict";
var oracledb = require('oracledb');
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
var constantes = require('../util/constantes');
var soap = require('strong-soap').soap;
var soapPromised = require('../util/soapPromised');
//var url = 'http://10.20.16.16:8180/IRSCentrodenegocios-sp-u/services/RemoteVentaVtexService?wsdl';
var url = constantes.dbUrlC;
var lo=0
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
app.use(bodyParser.text({ type: 'text/html' }))


module.exports = function () {
    return function (req, res) {
        oracledb.getConnection(
            constantes.dbPMMC,
            async function myFunc(err, connection) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                var entradaSP_INS_ORDER_CAB = {
                    P_ORG_LVL_NUMBER_SAP: req.body.idTienda,
                    P_IDCLIENTE: req.body.idCliente,
                    P_ORDERID: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
                    P_RESULT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                    P_MSG: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
                    P_MSGDTL: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                };
                console.log("EJECUCION DE SP SP_INS_ORDER_CAB")
                let entradaSP_INS_ORDER_CABResult = await connection.execute(
                    /*****************************SP_INS_ORDER_CAB******************************************* */
                    `BEGIN  APP_PKG_APP.SP_INS_ORDER_CAB(:P_ORG_LVL_NUMBER_SAP, :P_IDCLIENTE, :P_ORDERID, :P_RESULT, :P_MSG, :P_MSGDTL);
        COMMIT; END;` ,
                    entradaSP_INS_ORDER_CAB,
                    {
                        outFormat: oracledb.OBJECT
                    },
                )
                console.log("RESPUESTA DE SP SP_INS_ORDER_CAB" + entradaSP_INS_ORDER_CABResult)


                if (entradaSP_INS_ORDER_CABResult.outBinds.P_RESULT === 0) {
                    let orderid = entradaSP_INS_ORDER_CABResult.outBinds.P_ORDERID;
                    /**************************SP_INS_ORDER_DET********************************* */

                    console.log("TAMAÑO DE ITEMS: " + req.body.items.length)
                    var salida = []
                    var lista = []
                    for (let i = 0; i < req.body.items.length; i++) {
                        console.log("INICIO EJECUCION ("+i+")")
                        var entradaSP_INS_ORDER_DET = {
                            P_ORDERID: orderid,
                            P_BARCODE: req.body.items[i].barcode,
                            P_QTY: req.body.items[i].qty,
                            P_PRICE: req.body.items[i].price,
                            P_RESULT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                            P_MSG: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
                            P_MSGDTL: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                        };
                        console.log("*****ENTRADA DE INS ORDER *****")
                        console.log(entradaSP_INS_ORDER_DET)
                        console.log("*****************")
                        let entradaSP_INS_ORDER_DETResult = await connection.execute(
                            `BEGIN APP_PKG_APP.SP_INS_ORDER_DET(:P_ORDERID, :P_BARCODE, :P_QTY, :P_PRICE, :P_RESULT, :P_MSG, :P_MSGDTL); COMMIT; END;`,
                            entradaSP_INS_ORDER_DET,
                            {
                            })
                        }
                        if (entradaSP_INS_ORDER_CABResult.outBinds.P_RESULT < 1) {
                            //console.log("RESPUESTA DE INS_ORDER_DET: " + entradaSP_INS_ORDER_DETResult.outBinds.P_RESULT)
                            /*******************SP_GET_ORDER_TO_CN************************************************************** */
                            var entradaSP_GET_ORDER_TO_CN = {
                                P_ORDERID: orderid,
                                IO_CURSOR: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                                P_RESULT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                                P_MSG: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
                                P_MSGDTL: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                            };
                            let commit = await connection.execute(
                                "ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '. '")

                            let entradaSP_GET_ORDER_TO_CNResult = await connection.execute(
                                `BEGIN 
                            APP_PKG_APP.SP_GET_ORDER_TO_CN(:P_ORDERID, :IO_CURSOR, :P_RESULT, :P_MSG, :P_MSGDTL); 
                            if(:IO_CURSOR IS NULL) then OPEN :IO_CURSOR FOR SELECT * FROM dual WHERE 1 = 0; end if; END;`,
                                entradaSP_GET_ORDER_TO_CN,
                                {
                                    maxRows: 1
                                })
                            let rows = await entradaSP_GET_ORDER_TO_CNResult.outBinds.IO_CURSOR.getRows(50);
                            var requestArgs = {}
                            console.log("----------------")
                            console.log(rows.length)
                            console.log("----------------")
                            while (rows.length) {
                                for (let x = 0; x < rows.length; x += 1) {
                                    console.log("----------------")
                                    //console.log(rows[x][17])
                                    lista.push({
                                        //cod_ean_prod: rows[x][17]

                                        cantidad: rows[x][14],
                                        cantidad_aut: rows[x][15],
                                        cantidad_ope: rows[x][16],
                                        cod_ean_prod: rows[x][17],
                                        cod_int_prod: rows[x][18],
                                        esDespachado: rows[x][19],
                                        id_entidad: rows[x][20],
                                        num_linea: rows[x][21],
                                        precio_costo: rows[x][22],
                                        precio_venta: rows[x][23],
                                        tipo_prod: rows[x][24]
                                    })
                                }
                                console.log("----------------")
                                console.log(lista)
                                //console.log(rows[1][17])
                                console.log("----------------")
                                var requestArgs = {
                                    in0: {
                                        apellido_materno: rows[0][0],
                                        apellido_paterno: rows[0][1],
                                        calle: rows[0][2],
                                        codSociedad: rows[0][3],
                                        departamento: rows[0][4],
                                        fecha_despacho: rows[0][5],
                                        fecha_valida_desde: rows[0][6],
                                        fecha_valida_hasta: rows[0][7],
                                        idEcomerce: rows[0][8],
                                        id_ciudad: rows[0][9],
                                        id_entidad: rows[0][10],
                                        id_forma_pago: rows[0][11],
                                        id_localidad: rows[0][12],
                                        id_tipo_doc_identidad: rows[0][13],
                                        list_detalle: {
                                            ProductoCotizacionVtexDTO:
                                            
                                                lista
                                            
                                        },
                                        local_venta: rows[0][25],
                                        login_atendedor: rows[0][26],
                                        nombre: rows[0][27],
                                        nombre_atendedor: rows[0][28],
                                        nombre_cliente: rows[0][29],
                                        num_doc_identidad: rows[0][30],
                                        numero: rows[0][31],

                                        pickingAutomatico: rows[0][32],

                                        referencia: 0,
                                        retiraTienda: rows[0][34],
                                        telefono_contacto: rows[0][35],
                                        tipo_op: rows[0][36],
                                        total_neto: rows[0][37],
                                        total_venta: rows[0][38]
                                    }
                                }
                                console.log( "requestArgsSSSSS")
                                console.log( requestArgs.in0.list_detalle)
                                console.log( "requestArgsSSSS")
                                rows = await entradaSP_GET_ORDER_TO_CNResult.outBinds.IO_CURSOR.getRows(50);
                                //var options = {};
                                

                                //console.log('soapPromised: ', soapPromised)
                                //const client = await soapPromised.createClient(url, options)
                                    //var method = client['ingresarCotizacionVtex'];
                                    //console.log("antes de method "+client)
                                //await method(requestArgs, async function (err, result, envelope, soapHeader) {

                                        //var idcn = (result.out)
                                        //console.log("RESPUESTA DE WS: " + idcn);
                                        let idcn = await consultarWS(requestArgs)
                                        /*******************SP_UPD_ORDER_CAB**************************************************************/
                                        //{
                                            console.log("INVOCAR A UPD_ORDER_CAB")
                                            var entradaSP_UPD_ORDER_CAB = {
                                                P_ORDERID: orderid,
                                                P_IDCN: idcn,
                                                P_ORDEREAN: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
                                                P_RESULT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                                                P_MSG: { type: oracledb.STRING, dir: oracledb.BIND_INOUT },
                                                P_MSGDTL: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                                            };
                                            console.log(entradaSP_UPD_ORDER_CAB)
                                            /* */
                                            let entradaSP_UPD_ORDER_CABResult = await connection.execute(
                                                //`BEGIN APP_PKG_APP.SP_LOGIN(:P_IDCLIENTE, :P_NOMCLIENTE, :P_RESULT, :P_MSG, :P_MSGDTL); END;`,
                                                `CALL APP_PKG_APP.SP_UPD_ORD_CAB(:P_ORDERID, :P_IDCN,:P_ORDEREAN, :P_RESULT, :P_MSG, :P_MSGDTL)`,
                                                entradaSP_UPD_ORDER_CAB,
                                                {
                                                    maxRows: 1
                                                })

                                            let responseSP_UPD_ORDER_CAB = {
                                                idTransaction: entradaSP_UPD_ORDER_CABResult.outBinds.P_ORDEREAN
                                            };
                                            console.log("salida: "+JSON.stringify(responseSP_UPD_ORDER_CAB))
                                            var errorSP_UPD_ORDER_CAB = {
                                                codeError: 1,
                                                messageError: "Pedido no generado",
                                                messageDetail: "Oralce unique index exception. Table: EINTERFACE.PEDIDOS. Id " + entradaSP_UPD_ORDER_CABResult.outBinds.P_ORDEREAN
                                            };
                                            //if (err) {
                                                //console.error(err.message);
                                                //doRelease(connection);
                                                //res.send(404, err.message)
                                                //return;
                                            //}
                                            //salida.push((responseSP_UPD_ORDER_CAB))
                                            //lo=1+lo
                                            //console.log(salida)
                                            /*if (lo = 2) {
                                                //res.send(200,JSON.stringify(responseSP_UPD_ORDER_CAB)) 
                                                //res.send(200, JSON.stringify(salida))
                                                //salida.push(JSON.stringify(responseSP_UPD_ORDER_CAB))
                                                console.log(salida)


                                            }*/

                                            if (entradaSP_UPD_ORDER_CABResult.outBinds.P_RESULT < 1) {
                                                res.send(200,JSON.stringify(responseSP_UPD_ORDER_CAB)) 
                                                //salida.push((responseSP_UPD_ORDER_CAB))
                                                //console.log(salida)


                                            }
                                            else {
                                                res.send(404, errorSP_UPD_ORDER_CAB)
                                            }
                                            /*doRelease(connection);
                                             function doRelease(connection) {
                                               connection.close(
                                                 function(err) {
                                                   if (err) {
                                                     console.error(err.message);
                                                   }
                                                 })}  */

                                        //}
                                        ///////////////////////////////

                                    //});
                                    //console.log(fn_despacho_listarResult)

                                // });

                            }


                            //console.log(entradaSP_GET_ORDER_TO_CNResult.outBinds.IO_CURSOR)
                            if (entradaSP_GET_ORDER_TO_CNResult.outBinds.P_RESULT < 1) {


                            }
                            else {
                                res.send(404, result3)
                                console.log("Error en SP_GET_ORDER_TO_CN")
                            }



                        }

                        else {
                            res.send(404, result2)
                            console.log("Error en SP_INS_ORDER_DET")

                        }

                        ///////////////
                        //console.log("FIN EJECUCION ("+i+")")
                   // }
                    //res.send(200, JSON.stringify(salida))
                   
                }
                else {
                    res.send(404, entradaSP_INS_ORDER_CABResult)
                    console.log("Error en SP_INS_ORDER_CAB")
                }
                //console.log(salida)
                //var salidas=salida
            });
    }
};

async function consultarWS(requestArgs) {
    console.log("[registrarPedido2]::[consultarWS]::[Inicio]")
    try {
        //console.log("ENTRO A TRY")
        var options = {}
        //console.log("ANTES DE CREATE CLIENT")
        let cliente = await soapPromised.createClient(url, options)
        //console.log("CLIENTE: "+cliente)
        //console.log("DESPUES DE CREATE CLIENT")
        //console.log("ANTES DE METHOD 222")
        var metodo = await cliente['ingresarCotizacionVtex'];
        
        let responseWS = await soapPromised.consultar(metodo,requestArgs)
        //console.log("METODO: "+JSON.stringify(metodo) )
        //console.log("DESPUES DE METHOD")

        console.log("[registrarPedido2]::[consultarWS]::[Fin]")
        return responseWS.out
    } catch (error) {
        console.log("[registrarPedido2]::[consultarWS]::[Error]")
        throw new Error("Error en el metodo consultaWS: "+error.stack)
    }
};

