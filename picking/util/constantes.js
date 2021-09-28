const dbPMM = require('../baseDatos/dbconfigPMM')
const dbCT2 = require('../baseDatos/dbconfigCT2')
const dbPU = require('../baseDatos/dbconfigPUC')
const dbCEM = require('../baseDatos/dbconfigCEM')
const dbDP = require('../baseDatos/dbconfigDP')
const dbappSPSA = require('../baseDatos/dbconfigappSPSA')
const dbCEMCoupons = require('../baseDatos/dbconfigCEMCoupons')

module.exports.dbUrlC = 'http://10.20.17.227:8080/IRSCentrodenegocios-sp/services/RemoteVentaVtexService?wsdl'


/*Login DB PMM*/
module.exports.dbPMMC={
    user          : dbPMM.user,
    password      : dbPMM.password,
    connectString : dbPMM.connectString
}

/*Login DB CT2*/
module.exports.dbCT2C={
    user          : dbCT2.user,
    password      : dbCT2.password,
    connectString : dbCT2.connectString
}

module.exports.dbPUC={
    user          : dbPU.user,
    password      : dbPU.password,
    connectString : dbPU.connectString
}

module.exports.dbCEMC={
    user: dbCEM.user,
    password: dbCEM.password,
    server: dbCEM.server,
    database: dbCEM.database,
    port: dbCEM.port
    /*options: {
        encrypt: false // Use this if you're on Windows Azure    
    }*/

}

module.exports.dbCEMCouponsC={
    user: dbCEMCoupons.user,
    password: dbCEMCoupons.password,
    server: dbCEMCoupons.server,
    database: dbCEMCoupons.database,
    port: dbCEMCoupons.port
    /*options: {
        encrypt: false // Use this if you're on Windows Azure    
    }*/

}

module.exports.dbDPC={
    host: dbDP.host,
    user: dbDP.user,
    password: dbDP.password,
    database: dbDP.database    
}

module.exports.dbappSPSAC={
    host: dbappSPSA.host,
    user: dbappSPSA.user,
    password: dbappSPSA.password,
    database: dbappSPSA.database    
}
