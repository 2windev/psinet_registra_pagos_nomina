/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
 define(['N/email', 'N/format','N/runtime', './libs/2win_lib_search_nominas_de_pago.js', './libs/2win_lib_procesar_datos_nomina.js'],
 function(email, format, runtime, nominas, procesar) {
     function execute(context) {

        var resultSearchFile = nominas.searchFilePayroll();
        log.debug("result Search File", resultSearchFile)
        var filePacPat = 'PATPAC';
        var fileCajaVecina = 'CAJAVECINA';
        var fileServipag = 'SERVIPAG';
        var internalIdFile = "";
        var nameFile = "";
        var typeFile = "";
        var resultExistsPayroll = "";
        var date = format.parse({
            value: new Date(),
            type: format.Type.DATE
        });
        resultSearchFile.map(function(key){
            typeFile = key.name.split('_')[0].toUpperCase();
            if(typeFile === filePacPat){
                log.debug("resultado Archivo Pat Pac", key);
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
                resultExistsPayroll = nominas.searchPayroll(nameFile);
                log.debug("result Exists Payroll", resultExistsPayroll)
                if(resultExistsPayroll == false){
                    procesoRegistroPagoNómina(internalIdFile, nameFile, typeFile, date);
                }else {
                    log.debug("Error al intentar procesar Nómina", "Archivo de Nómina ya fue procesado anteriormente")
                }
            } else if(typeFile === fileCajaVecina){
                log.debug("resultado Archivo Caja Vecina", key);
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
                resultExistsPayroll = nominas.searchPayroll(nameFile)
                log.debug("result Exists Payroll", resultExistsPayroll)
                if(resultExistsPayroll == false){
                    procesoRegistroPagoNómina(internalIdFile, nameFile, typeFile, date);
                }else {
                    log.debug("Error al intentar procesar Nómina", "Archivo de Nómina ya fue procesado anteriormente")
                }
            } else if(typeFile === fileServipag){
                log.debug("resultado Archivo Servipag", key);
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
                resultExistsPayroll = nominas.searchPayroll(nameFile)
                log.debug("result Exists Payroll", resultExistsPayroll)
                if(resultExistsPayroll == false){
                    procesoRegistroPagoNómina(internalIdFile, nameFile, typeFile, date);
                } else {
                    log.debug("Error al intentar procesar Nómina", "Archivo de Nómina ya fue procesado anteriormente")
                }
            }
        });
        
                    
    }

    function procesoRegistroPagoNómina(internalIdFile, nameFile, typeFile, date){
        var datosNomina={
            name_file: nameFile,
            type_file: typeFile,
            date_time: date
        }

        log.debug("Datos Nomina", datosNomina);

        var idRecordPayroll = procesar.registerPayroll(datosNomina);
        log.debug("id registro tabla registro nómina", idRecordPayroll);

        log.debug("internal Id File", internalIdFile)
        var resultRecordPayments = procesar.readPayrollFile(internalIdFile);
        // log.debug("Resultado registro de pagos", resultRecordPayments);
        if(resultRecordPayments[0].hasOwnProperty("error")){
            // procesar.updateState(idRecordPayroll, "Error");
            log.debug("Error al registrar pago", "se envía email a diego.munoz@2win.cl"); // runtime.getCurrentUser().email
            email.send({
                author: 46126, //runtime.getCurrentUser().id
                recipients: 'diego.munoz@2win.cl', //runtime.getCurrentUser().email
                subject: 'Error Al Registrar los Pagos',
                body: 'Se ha identificado el siguiente Error al registrar los pagos de la nómina id: ' + internalIdFile + '\n' + resultRecordPayments[0].error
            });
        } else {
            log.debug("id registros de pagos", resultRecordPayments);
            // procesar.updateState(idRecordPayroll, "Procesado");
            email.send({
                author: 46126, //runtime.getCurrentUser().id
                recipients:'diego.munoz@2win.cl', //runtime.getCurrentUser().email
                subject: 'Registrar Pagos',
                body: 'Registros de pagos completados satisfactoriamente.'
            });
        }
    }

     
     return {
         execute: execute
     };
 });