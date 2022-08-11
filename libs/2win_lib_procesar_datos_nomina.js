/**
 * @NApiVersion 2.x
 * @module ./2win_lib_procesar_datos_nomina.js
 * @NModuleScope Public
 **/
define(['N/file', 'N/record', './2win_lib_search_nominas_de_pago.js'], 
    function(file, record, nominas) {
        function readPayrollFile(payroll){
            var payrollFile = file.load({id: `SuiteScripts/psinet_registra_pagos_nomina/pago_nominas/${payroll}`});
            var data = [];
            var json = {};
            payrollFile.lines.iterator().each(function (line) {
                data = line.value.split(",");
                // log.debug("arreglo data nómina", data);
                for(i in data){
                    json[i] = data[i];
                }

                //TODO crear registro en tabla transacciones de tipo PAGO.
                
                objRecord = record.create({
                    type: record.Type.CUSTOMER_PAYMENT,
                    isDynamic: true
                });
                var name = json[0];
                log.debug("name", name);
                var idCustomer = nominas.searchCustomer(name);
                log.debug("idCustomer", idCustomer);
                objRecord.setValue({
                    fieldId: "customer",
                    value: idCustomer
                });
                objRecord.setValue({
                    fieldId: "subsidiary",
                    value: 5
                });
                objRecord.setValue({
                    fieldId: "payment",
                    value: json[3]
                });
                var idRecord = objRecord.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: false
                })
                log.debug("id registro nuevo en trasacciones", idRecord);
                return true;
            });
            
        }
        return {
            readPayrollFile : readPayrollFile
        };
    
});