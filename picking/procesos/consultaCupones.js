const sql = require('mssql')
const sql2 = require('mssql')
var mysql = require('async-mysql');
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
//var rp = require('request-promise')
var constantes = require('../util/constantes');
const util = require('util');
var cadena = ""
var cadena2 = ""
var Respuesta

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
module.exports = function () {
    console.log("1")
    return async function (req, res) {
        try {
            (async function () {
                let pool = await sql.connect(constantes.dbCEMC)
                let result2 = await pool.request()
                    .input('TIPO_DOCUMENTO', sql.Int, req.body.TIPO_DOCUMENTO)
                    .input('NUMERO_DOCUMENTO', sql.Int, req.body.NUMERO_DOCUMENTO)
                    //.input('TIPO_DOCUMENTO', sql.Int, req.body.tipo_documento)
                    //.input('NUMERO_DOCUMENTO', sql.Int, req.body.numero_documento)
                    .execute('dbo.APPV_CONSULTACUPONES')
                console.log("*******APPV_CONSULTACUPONES - CEM***********************")
                console.log(req.body)
                // console.log(result2.recordset[0].promoVarCode)
                for (var i = 0; i < result2.recordset.length; i++) {
                    var promoVarCode = result2.recordset[i].promoVarCode
                    cadena = promoVarCode + "," + cadena
                }
                var tama = cadena.length;
                var conca = cadena.substring(0, tama - 1);
                //console.log(result2.recordset.length)
                //for (var i = 0; i < 1; i++) {

                var salidaE = {
                    O_CURSOR: null,
                    O_COD_CURSOR: 1,
                    O_DET_MENSAJE: "CLIENTE NO TIENE CUPONES ASIGNADOS"
                }
                console.log("--------RES---------------")
                console.log(conca)
                if (conca !== "") {
                    let connection = await mysql.connect(
                        constantes.dbDPC
                    );
                    console.log("*******APPV_CONSULTACUPONES - DP***********************")
                    console.log("call APPV_CONSULTACUPONES ('"+conca+"')")
                    //var ex = '51242,51241'
                    //    try {
                    let rows = await connection.query("call APPV_CONSULTACUPONES ('"+conca+"')");
                    //let rows = await connection.query('call APPV_CONSULTACUPONES ("' + result2.recordset[i].promoVarCode + '")');
                    sub2 = (rows[0].length)
                    for (var k = 0; k < sub2; k++) {
                        var PROMOTIONVARIABLE = rows[0][k].PROMOTIONVARIABLE
                        cadena2 = PROMOTIONVARIABLE + "," + cadena2
                    }
                    var tama2 = cadena2.length;
                    var conca2 = cadena2.substring(0, tama2 - 1);
                    //conca2 = 51006
                    //  for (var j = 0; j < sub2; j++) {
                    // console.log(rows[0][j].VARIABLE)
                    console.log("--------RES---------------")
                    console.log(conca2)

                    ////////////////////////////////////////
                    sql.close()
                    let pool2 = await sql.connect(constantes.dbCEMCouponsC)
                    console.log("*******APPV_CONSULTA_CUPONES - CEM COUPONS***********************")
                    let result3 = await pool2.request()
                        .input('dpcUseLimitPromovar', sql.Char, conca2)
                        .execute('dbo.APPV_CONSULTACUPONES')
                    console.log("*********RES*********************")
                    console.log(result3.recordset)
                    if (result3.recordset.length) {
                        //console.log(result3.recordset[0])
                        Respuesta ={
                            O_CURSOR: result3.recordset,
                            O_COD_CURSOR : 0,
                            O_DET_MENSAJE : "OK"
                        } 
                    }
                    //   }
                    console.log("+++++++++++++++++++++++++")
                    //}
                    sql.close()
                    //console.log(Respuesta)
                    res.send(200, (Respuesta))
                    cadena = ""
                    cadena2 = ""
                } else {
                    sql.close()
                    res.send(404, salidaE);
                }
                //console.log('conectanto a DP')

                //Respuesta = []
            })()
        } catch (err) {
            res.send(404, "result2");
            console.error('SQL error', err);
        }
    }
}