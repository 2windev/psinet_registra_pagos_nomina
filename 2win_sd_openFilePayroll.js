/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
 define(['N/email', 'N/format','N/runtime', './libs/2win_lib_search_nominas_de_pago.js', './libs/2win_lib_procesar_datos_nomina.js'],
 function(email, format, runtime, nominas, procesar) {
     function execute(context) {

        var resultSearchFile = nominas.searchFilePayroll();
        var filePacPat = 'PAT-PAC';
        var fileBcoEstado = 'BANCO-ESTADO';
        var fileServipag = 'SERVIPAG';
        var internalIdFile = "";
        var nameFile = "";
        var date = format.parse({
            value: new Date(),
            type: format.Type.DATE
        });
        resultSearchFile.map(function(key){
            if(key.name.split('.')[0].toUpperCase().split('_') === filePacPat){
                log.debug("resultado Archivo Pat-Pac", key);
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
            } else if(key.name.split('.')[0].toUpperCase() === fileBcoEstado){
                log.debug("resultado Archivo Banco-Estado", key);
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
            } else if(key.name.split('.')[0].toUpperCase() === fileServipag){
                log.debug("resultado Archivo Servipag", key);
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
            }
        });
        log.debug("sobre datos nomina", " - ")
        var datosNomina={
            name_file: nameFile,
            date_time: date
        }

        log.debug("Datos Nomina", datosNomina);

        var idRecordPayroll = procesar.registerPayroll(datosNomina);
        log.debug("id registro tabla registro nómina", idRecordPayroll);
        var resultSearchNominas = nominas.searchPayroll();
        var namePayroll = resultSearchNominas.map((item)=>{
            
            if(item.internal_id == idRecordPayroll){
                log.debug("NOMBRE NOMINA", item.name);
                return item.name;  
            }
        });
        var resultRecordPayments = procesar.readPayrollFile(internalIdFile);
        log.debug("Resultado registro de pagos", resultRecordPayments);
        namePayroll = namePayroll.toString().replace(/,/gi, '');
        var payments = procesar.readPayrollFile(namePayroll);
        // log.debug("Error Property?", payments[0].hasOwnProperty("error"));
        if(payments[0].hasOwnProperty("error")){
            // procesar.updateState(idRecordPayroll, "Error");
            log.debug("Error al registrar pago", "se envía email a " + runtime.getCurrentUser().email);
            email.send({
                author: runtime.getCurrentUser().id,
                recipients: runtime.getCurrentUser().email,
                subject: 'Error Al Registrar los Pagos',
                body: 'Se ha identificado el siguiente Error al registrar los pagos de la nómina id: ' + id + '\n' + payments[0].error
            });
        } else {
            log.debug("id registros de pagos", payments);
            // procesar.updateState(idRecordPayroll, "Procesado");
            email.send({
                author: runtime.getCurrentUser().id,
                recipients: runtime.getCurrentUser().email,
                subject: 'Registrar Pagos',
                body: 'Registros de pagos completados satisfactoriamente.'
            });
        }
                    
    }

     
     return {
         execute: execute
     };
 });