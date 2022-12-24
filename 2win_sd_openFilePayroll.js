/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
 define(['N/email', 'N/format','N/runtime', './libs/2win_lib_search_nominas_de_pago.js', './libs/2win_lib_procesar_datos_nomina.js'],
 function(email, format, runtime, nominas, procesar) {
     function execute(context) {

        var resultSearchFile = nominas.searchFilePayroll();
        // log.debug("nóminas en directorio archivos_nominas", resultSearchFile);

        var mediosDePago = nominas.searchPaymentMedia();
        log.debug("medios de pago", mediosDePago);
        
        var internalIdFile = "";
        var nameFile = "";
        var typeFile = "";
        var extensionFile = "";
        var resultExistsPayroll = "";
        var date = format.parse({
            value: new Date(),
            type: format.Type.DATE
        });
        resultSearchFile.map(function(key){
            typeFile = key.name.split('_')[0];
            extensionFile = key.name.split('.')[1];
            if(typeFile == mediosDePago[0].name){
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
                resultExistsPayroll = nominas.searchPayroll(nameFile);
                if(resultExistsPayroll === false){
                    log.debug("resultado Archivo Pac Pat", key);
                    procesoRegistroPagoNomina(internalIdFile, nameFile, typeFile, date, mediosDePago[0].id_forma_pago);
                }
            } else if(typeFile == mediosDePago[3].name){
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
                resultExistsPayroll = nominas.searchPayroll(nameFile)
                if(resultExistsPayroll == false){
                    log.debug("resultado Archivo Caja Vecina", key);
                    procesoRegistroPagoNomina(internalIdFile, nameFile, typeFile, date, mediosDePago[3].id_forma_pago);
                }
            } else if(typeFile == mediosDePago[2].name){
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
                resultExistsPayroll = nominas.searchPayroll(nameFile)
                if(resultExistsPayroll == false){
                    log.debug("resultado Archivo Servipag", key);
                    procesoRegistroPagoNomina(internalIdFile, nameFile, typeFile, date, mediosDePago[2].id_forma_pago);
                } 
            }
        });  
    }

    function procesoRegistroPagoNomina(internalIdFile, nameFile, typeFile, date, medioPago){
        var datosNomina={
            name_file: nameFile,
            type_file: typeFile,
            date_time: date
        }
        log.debug("JSON datosNomina", datosNomina);

        var idRecordPayroll = procesar.registerPayroll(datosNomina);
        log.debug("id registro tabla Personalizada", idRecordPayroll);
        log.debug("medio de pago", medioPago)
        var resultRecordPayments = procesar.readPayrollFile(internalIdFile, typeFile, medioPago);
        log.debug("resultado registro de pago", resultRecordPayments)

        //TODO implementaciónde envío de email y mejora al manejo de errores en 2 etapa.
        if(resultRecordPayments[0].hasOwnProperty("error")){
            // log.debug("Error al registrar pago", "se envía email a diego.munoz@2win.cl"); // runtime.getCurrentUser().email
            // email.send({
            //     author: 46126, //runtime.getCurrentUser().id
            //     recipients: 'diego.munoz@2win.cl', //runtime.getCurrentUser().email
            //     subject: 'Error Al Registrar los Pagos',
            //     body: 'Se ha identificado el siguiente Error al registrar los pagos de la nómina id: ' + internalIdFile + '\n' + resultRecordPayments[0].error
            // });
            log.debug('Error en nómina id: ' + internalIdFile, resultRecordPayments[0].error);

        } else {
            // email.send({
            //     author: 46126, //runtime.getCurrentUser().id
            //     recipients:'diego.munoz@2win.cl', //runtime.getCurrentUser().email
            //     subject: 'Registrar Pagos',
            //     body: 'Registro de pago finalizado. \n' + "Registro Pago: " + resultRecordPayments
            // });
            log.debug('Registro de pago finalizado', "Registro Pago: " + resultRecordPayments);
        }
    }

     return {
         execute: execute
     };
 });