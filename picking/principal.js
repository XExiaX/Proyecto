
const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.port || 3001
const app = express();


const login                 = require('./procesos/login');
const consultarProducto     = require('./procesos/consultarProducto');
const consultarPedidoCab    = require('./procesos/consultarPedidoCab');
const consultarVtaHistoCab  = require('./procesos/consultarVtaHistoCab');
const consultarPedVtaDet    = require('./procesos/consultarPedVtaDet');
const registrarPedido       = require('./procesos/registrarPedido');
const validaBINES           = require('./procesos/validaBINES');
const actualizarUsuario     = require('./procesos/actualizarUsuario');
const consumoCliente        = require('./procesos/consumoCliente');
const consultaCupones       = require('./procesos/consultaCupones');
const consultaDescuentos    = require('./procesos/consultaDescuentos');
const health                = require('./procesos/health');

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/selfpicking/login', login());
app.post('/selfpicking/consultarProducto', consultarProducto());
app.post('/selfpicking/consultarPedidoCab', consultarPedidoCab());
app.post('/selfpicking/consultarVtaHistoCab', consultarVtaHistoCab());
app.post('/selfpicking/consultarPedVtaDet', consultarPedVtaDet());
app.post('/selfpicking/registrarPedido', registrarPedido());
app.post('/selfpicking/validaBINES', validaBINES());
app.post('/selfpicking/actualizarUsuario', actualizarUsuario());
app.post('/selfpicking/consumoCliente', consumoCliente());
app.post('/selfpicking/consultaCupones', consultaCupones());
app.post('/selfpicking/consultaDescuentos', consultaDescuentos());

app.get('/health', health);

app.listen(port,()=>{    
    console.log(`Escuchando ${port}`)
    })
app.timeout = 200000;


