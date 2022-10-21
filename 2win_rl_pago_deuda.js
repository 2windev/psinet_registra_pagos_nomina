/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
 define(['N/search', 'N/email', 'N/record', './libs/2win_lib_search_nominas_de_pago.js', './libs/2win_lib_procesar_datos_nomina.js'], 

 function(search, email, record, nominas, procesar) {
 
    function _get(context) {
        
     }
 
     function _post(context) {
        try{
            log.debug("POST", context);
            var rutSinDv = context.rut.substring(0,context.rut.length-1);
            var dv = context.rut.slice(-1);
            var rutCliente = rutSinDv + '-' + dv;
            var nBoleta = context.monto;
            var medioDePago = context.medio_pago.toUpperCase();
            var resultRecordPayments = [];

            if(medioDePago === 'PATPAC' || medioDePago === 'SERVIPAG'){
                resultRecordPayments.push(procesar.registerPayments(rutCliente, nBoleta));

            } else if(medioDePago === 'CAJAVECINA'){
                log.debug("rut cliente - cajavecina", rutCliente);
                log.debug("monto - cajavecina", nBoleta);
                var idRecordDeposit = registerDepositApplicated(rutCliente, nBoleta);
                log.debug("idRecordDeposit", idRecordDeposit)
                var recordDepositApplication = record.transform({	
                    fromType: record.Type.CUSTOMER_DEPOSIT,
                    fromId: idRecordDeposit,
                    toType: record.Type.DEPOSIT_APPLICATION,
                    isDynamic: true 
                });
                var lines = recordDepositApplication.getLineCount({ sublistId: 'apply' });
                for(var i = 0; i < lines; i++){
                    recordDepositApplication.selectLine({ sublistId:'apply', line: i });
                    recordDepositApplication.setCurrentSublistValue({ 
                        sublistId:'apply', 
                        fieldId:'apply', 
                        value: true, 
                        ignoreFieldChange: false 
                    });
                };
                recordDepositApplication.commitLine({ sublistId: 'apply' });
                var idDepositApp = recordDepositApplication.save();
                log.debug("idDepositApp", idDepositApp);
                resultRecordPayments.push({"id_pago" : idDepositApp});
            }                    
        } catch(error){
            log.error("Error al procesar pago", error.message);
            resultRecordPayments.push({"error" : error.message});
        }
        
        
        if(resultRecordPayments[0].hasOwnProperty("error")){
            log.debug("Error al registrar pago", "se envía email a diego.munoz@2win.cl"); // runtime.getCurrentUser().email
            email.send({
                author: 46126, //runtime.getCurrentUser().id
                recipients: 'diego.munoz@2win.cl', //runtime.getCurrentUser().email
                subject: 'Error Al Registrar los Pagos',
                body: 'Se ha identificado el siguiente Error al registrar los pagos '+ '\n' + resultRecordPayments[0].error
            });
            return {
                "code_error": "001",
                "desc_error": "Error al efectuar deposito de pago",
                "data": {}
            };
        } else {
            email.send({
                author: 46126, //runtime.getCurrentUser().id
                recipients:'diego.munoz@2win.cl', //runtime.getCurrentUser().email
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

    /**
     * @desc se crea registro de tipo aplicación de desposito en tabla de transacción para nóminas de tipo caja vecina.
     * @function registerDepositApplicated
     * @return Integer idRecordDeposit
     */
    function registerDepositApplicated(rutCliente, amount){
        //TODO internalIdCustomer, está obteniendo como valor false, esto proviene de la búsqueda de cliente por rut, pendiente revisar y solucionar.
        var internalIdCustomer = nominas.searchCustomer(rutCliente);
        log.debug("internalIdCustomer", internalIdCustomer);
        var objRecordDeposit = record.create({
            type: "customerdeposit",
            isDynamic: true
        });
        // log.debug("objRecordDeposit", objRecordDeposit);
        objRecordDeposit.setValue({ fieldId: 'customer', value: internalIdCustomer });
        objRecordDeposit.setValue({ fieldId: 'payment', value: amount });
        objRecordDeposit.setValue({ fieldId: 'subsidiary', value: 5 });

        var idRecordDeposit = objRecordDeposit.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });
        return idRecordDeposit;
    }

     /**
     * @desc Obtener datos según estructura de busqueda
     * @function getDataSearch
     * @param String createSearch
     * @return Array searchResults
     */
      function getDataSearch(createSearch){
        var searchResults = [];
        var saveSearch = search.create(createSearch);
        var searchResultCount = saveSearch.runPaged().count;
        if (searchResultCount == 0) {
            return false;
        }
        saveSearch.run().each(function (item) {
            var objectCompiled = {};
            for (var i = 0; i < item.columns.length; i++) {
                objectCompiled[item.columns[i].label] = item.getValue(item.columns[i]);
            }
            searchResults.push(objectCompiled);
            return true;
        });
        return searchResults;
    };
 
     return {
        //  get: _get,
         post: _post,
        //  put: _put,
        //  delete: _delete
     }
     
 });
 