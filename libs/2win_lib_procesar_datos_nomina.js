/**
 * @NApiVersion 2.x
 * @module ./2win_lib_procesar_datos_nomina.js
 * @NModuleScope Public
 **/
define(['N/file', 'N/record', './2win_lib_search_nominas_de_pago.js', 'N/format'], 
    function(file, record, nominas, format) {

        function registerPayroll(datosNomina){
            var objRecord  = record.create({
                type: "customrecord_2win_regist_nominas_de_pago",
                isDynamic: true
            });
            objRecord.setValue({
                fieldId: 'custrecord_user',
                value: datosNomina.user,
                ignoreFieldChange: true
            });
            objRecord.setValue({
                fieldId: 'custrecord_name_file',
                value: datosNomina.name_file,
                ignoreFieldChange: true
            });
            objRecord.setValue({
                fieldId: 'custrecord_date_time',
                value: datosNomina.date_time,
                ignoreFieldChange: true
            });
            objRecord.setValue({
                fieldId: 'custrecord_state',
                value: datosNomina.state,
                ignoreFieldChange: true
            });
            var idRecord = objRecord.save({
                enableSourcing: false,
                ignoreMandatoryFields: false
            });

            return idRecord;
        }

        function readPayrollFile(payroll){
            var payrollFile = file.load({id: `SuiteScripts/psinet_registra_pagos_nomina/pago_nominas/${payroll}`});
            var data = [];
            var json = {};
            var payments = [];
            payrollFile.lines.iterator().each(function (line) {
                data = line.value.split(",");
                // log.debug("arreglo data nómina", data);
                for(i in data){
                    json[i] = data[i];
                }

                //TODO crear registro en tabla transacciones de tipo PAGO.
                try{
                    var objRecord = record.create({
                        type: record.Type.CUSTOMER_PAYMENT,
                        isDynamic: true
                    });
                    var name = json[0];
                    log.debug("name", name);
                    var idCustomer = nominas.searchCustomer(name);
                    log.debug("idCustomer", idCustomer);
                    objRecord.setValue({
                        fieldId: "customer",
                        value: idCustomer // 42866
                    });
                    objRecord.setValue({
                        fieldId: "trandate",
                        value: format.parse({ value: '12/08/2022', type: format.Type.DATE })
                    });
                    objRecord.setValue({
                        fieldId: "subsidiary",
                        value: 5 // 5 -> pruebas desarrollo || 20 -> Proyectos y Servicios NetSuite
                    });
                    objRecord.setValue({
                        fieldId: "payment",
                        value: json[3]
                    });
                    var idRecordPago = objRecord.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: false
                    });
                    payments.push(idRecordPago);
                } catch(e){
                    log.debug("Error en registro de pagos", e.message); 
                    return [0,e.message];
                }
            });
            return payments;
        }

        function updateState(idPayroll, state){
            var objRecord  = record.load({
                type: "customrecord_2win_regist_nominas_de_pago",
                id: idPayroll
            });
            objRecord.setValue({
                fieldId: 'custrecord_state',
                value: state,
                ignoreFieldChange: true
            });
            objRecord.save({
                enableSourcing: false,
                ignoreMandatoryFields: false
            });
            
        }
        return {
            readPayrollFile : readPayrollFile,
            registerPayroll : registerPayroll,
            updateState : updateState
        };
    
});