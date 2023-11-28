/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
 define(['N/email', './libs/2win_lib_procesar_datos_nomina.js', 'N/runtime', './libs/2WinStaticParamsFacturacion.js'], 

 function(email, procesar, runtime, paramsFact) {
 
    function _get(context) {
        
     }
 
     function _post(context) {
        try{
            log.debug("POST", context);
            var rutSinDv = context.rut.substring(0,context.rut.length-1);
            var dv = context.rut.slice(-1);
            var rutCliente = rutSinDv + '-' + dv;
            log.debug("rutCliente", rutCliente);
            var folio = context.folio;
            var subsidiaria = context.subsidiaria;
            var medioDePago = paramsFact.getParam('payment_option_pago_web').number;
            var resultRecordPayments = [];
            var resultPayment = procesar.registerPayments(rutCliente, folio, medioDePago, subsidiaria);
            resultRecordPayments.push(resultPayment);
            
        } catch(error){
            log.error("Error al procesar pago", error.message);
            resultRecordPayments.push({"error" : error.message});
        }
        
        
        if(resultRecordPayments[0].hasOwnProperty("error")){
            log.debug("Error al registrar pago", resultRecordPayments[0].error);
            log.debug("Error al registrar pago", "se envía email a " + runtime.getCurrentUser().email);
            email.send({
                author: runtime.getCurrentUser().id,
                recipients: runtime.getCurrentUser().email,
                subject: 'Error Al Registrar los Pagos',
                body: 'Se ha identificado el siguiente Error al registrar los pagos '+ '\n' + resultRecordPayments[0].error
            });
            return {
                "code_error": "001",
                "desc_error": "Error al efectuar deposito de pago",
                "data": {}
            };
        } else {
            log.debug("resultado registro de pago", resultRecordPayments)  
            email.send({
                author: runtime.getCurrentUser().id,
                recipients: runtime.getCurrentUser().email,
                subject: 'Registrar Pagos',
                body: 'Registro de pago completado satisfactoriamente, ID registro de pago: ' + resultRecordPayments
            });
            return {
                "code_error": "000",
                "desc_error": "Pago de deuda realizado",
                "data": resultRecordPayments
            };
        }
     }
 
     function _put(context) {
         
     }
 
     function _delete(context) {
         
     }
 
     return {
        //  get: _get,
         post: _post,
        //  put: _put,
        //  delete: _delete
     }
     
 });
 