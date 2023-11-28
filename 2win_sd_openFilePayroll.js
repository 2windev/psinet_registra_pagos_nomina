/**
 *@NApiVersion 2.x
*@NScriptType ScheduledScript
*/
define(['N/email', 'N/format', './libs/2win_lib_search_nominas_de_pago.js', './libs/2win_lib_procesar_datos_nomina.js', './libs/2WinStaticParamsFacturacion.js'],
function(email, format, nominas, procesar, paramsFact) {
    function execute(context) {
        var resultSearchFile = nominas.searchFilePayroll();
        var mediosDePago = nominas.searchPaymentMedia();
        var internalIdFile = "";
        var nameFile = "";
        var typeFile = "";
        var subsidiaria = 0;
        var extensionFile = "";
        var resultExistsPayroll = "";
        
        var date = format.parse({
            value: new Date(),
            type: format.Type.DATE
        });
        resultSearchFile.map(function(key){

            var arrayNameFile = key.name.split('_');
            typeFile = arrayNameFile[0];
            subsidiaria = Number(arrayNameFile[1]);
            extensionFile = key.name.split('.')[1];
            if(typeFile == mediosDePago[0].name){
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
                resultExistsPayroll = nominas.searchPayroll(nameFile);
                if(resultExistsPayroll === false){
                    log.debug("resultado Archivo Pac Pat", key);
                    procesoRegistroPagoNomina(internalIdFile, nameFile, typeFile, date, mediosDePago[0].id_forma_pago, subsidiaria);
                }
            } else if(typeFile == mediosDePago[3].name){
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
                resultExistsPayroll = nominas.searchPayroll(nameFile)
                if(resultExistsPayroll == false){
                    log.debug("resultado Archivo Caja Vecina", key);
                    procesoRegistroPagoNomina(internalIdFile, nameFile, typeFile, date, mediosDePago[3].id_forma_pago, subsidiaria);
                }
            } else if(typeFile == mediosDePago[2].name){
                internalIdFile = Number(key.internal_id);
                nameFile = key.name;
                resultExistsPayroll = nominas.searchPayroll(nameFile)
                if(resultExistsPayroll == false){
                    log.debug("resultado Archivo Servipag", key);
                    procesoRegistroPagoNomina(internalIdFile, nameFile, typeFile, date, mediosDePago[2].id_forma_pago, subsidiaria);
                } 
            }
        });  
    }

    function procesoRegistroPagoNomina(internalIdFile, nameFile, typeFile, date, medioPago, subsidiaria){
        try{
            var datosNomina={
                name_file: nameFile,
                type_file: typeFile,
                date_time: date
            }
            log.debug("JSON datosNomina", datosNomina);
    
            var idRecordPayroll = procesar.registerPayroll(datosNomina);
            log.debug("id registro tabla Personalizada", idRecordPayroll);
            log.debug("medio de pago", medioPago)
            var resultRecordPayments = procesar.readPayrollFile(internalIdFile, typeFile, medioPago, subsidiaria);
    
            if(resultRecordPayments[0].hasOwnProperty("error")){
                var emails = paramsFact.getParam('pago_nominas_responsables').text;
                log.debug("Error al registrar pago", "se envía email a " + emails);
                email.send({
                    author: paramsFact.getParam('id_empleado_envio_email').text, 
                    recipients: emails,
                    subject: 'Error Al Registrar los Pagos',
                    body: 'Se ha identificado el siguiente Error al registrar los pagos de la nómina: ' + nameFile + ' id: ' + internalIdFile + '\n' + resultRecordPayments[0].error
                });
                log.debug('Error en nómina id: ' + internalIdFile, resultRecordPayments[0].error);
    
            } else {
                log.debug("resultado registro de pago", resultRecordPayments)
            }
        } catch(e){
            log.debug("Error", "Error en proceso registro de pago de la nómina " + nameFile);
        }
        
    }

     return {
         execute: execute
     };
 });