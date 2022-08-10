/**
 * @NApiVersion 2.x
 * @module ./2win_lib_search_nominas_de_pago.js
 * @NModuleScope Public
 **/
define(['N/file', 'N/record'], 
    function(file, record) {
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
                log.debug("json", json);
                //TODO crear registro en tabla transacciones, pendiente saber tipo de transacción.
                // objRecord = record.create({
                //     type: "string",
                //     isDynamic: boolean,
                //     defaultValues: Object
                // })
                return true;
            });
            
        }
        return {
            readPayrollFile : readPayrollFile
        };
    
});