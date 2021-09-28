const sql = require('mssql')
const sql2 = require('mssql')
var mysql = require('async-mysql');
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
//var rp = require('request-promise')
var constantes = require('../util/constantes');
const util = require('util');

var Respuesta = []

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
module.exports = function () {
    console.log("1")
    return async function (req, res) {
        (async function () {
            let pool = await sql.connect(constantes.dbCEMCouponsC)
            let result2 = await pool.request()
            .input('codigoCupon', sql.Int, req.body.codigoCupon)
           
            .execute('dbo.APPV_CONSULTADESCUENTOS')
        console.log("******************************")
        console.log(result2.recordset.length)
        for (var i = 0; i < result2.recordset.length; i++) {   
            console.log(result2.recordset[i].variableCodigo)

            let connection = await mysql.connect(
                constantes.dbDPC
            );
         
            let rows = await connection.query('call APPV_CONSULTADESCUENTOS ("'+result2.recordset[i].variableCodigo+'")');
           sub2= (rows[0].length)
            for (var j = 0; j < sub2; j++) { 
               // console.log(rows[0][j].VARIABLE)
               console.log("-----------------------")
               console.log(rows[0].length)
               console.log(rows[0][j])
               if (sub2){
                //console.log(result2.recordset)
                Respuesta.push(rows[0][j])
                }
               ////////////////////////////////////////
              /* sql.close()
               let pool = await sql.connect(constantes.dbCEMCouponsC)
               let result2 = await pool.request()
               .input('variableCupon', sql.Int, rows[0][j].VARIABLE)
               
               .execute('dbo.APPV_CONSULTACUPONES')
                console.log("******************************")
                if (result2.recordset.length){
                    console.log(result2.recordset)
                    Respuesta.push(result2.recordset)
                }*/
                
                
               //////////////////////////////////////
             
                //console.log(rows.length)
            }
            console.log("+++++++++++++++++++++++++")
            }
            sql.close()
            console.log(Respuesta)
            res.send(200, (Respuesta))
            Respuesta=[]
        })()
        
            
    }
}