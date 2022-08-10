/**
 * @NApiVersion 2.x
 * @module ./2win_lib_search_nominas_de_pago.js
 * @NModuleScope Public
 **/
define(['N/file'], 
    function(file) {
        function readPayrollFile(payroll){
            var payrollFile = file.load({id: `SuiteScripts/psinet_registra_pagos_nomina/pago_nominas/${payroll}`});
            var data = [];
            payrollFile.lines.iterator().each(function (line) {
                data = line.value.split(",");
                log.debug("arreglo data nómina", data);
                return true;
            });
        }
        return {
            readPayrollFile : readPayrollFile
        };
    
});