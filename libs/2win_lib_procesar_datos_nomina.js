/**
 * @NApiVersion 2.x
 * @module ./2win_lib_procesar_datos_nomina.js
 * @NModuleScope Public
 **/
define(['N/file', 'N/record', './2win_lib_search_nominas_de_pago.js', 'N/format', './2WinUtilityStaticParams.js'], 
    function(file, record, nominas, format, params) {

        function registerPayroll(datosNomina){
            var objRecord  = record.create({
                type: "customrecord_2win_archivos_pago_proces",
                isDynamic: true
            });
            objRecord.setValue({ fieldId: 'name', value: datosNomina.name_file, ignoreFieldChange: true });
            objRecord.setValue({ fieldId: 'custrecord1470', value: datosNomina.type_file, ignoreFieldChange: true });
            objRecord.setValue({ fieldId: 'custrecord1471', value: datosNomina.date_time, ignoreFieldChange: true });
            // objRecord.setValue({ fieldId: 'custrecord_state', value: datosNomina.state, ignoreFieldChange: true });
            var idRecord = objRecord.save({
                enableSourcing: false,
                ignoreMandatoryFields: false
            });

            return idRecord;
        }

        function readPayrollFile(internalIdFile){

            var payrollFile = file.load({
                id: internalIdFile
            });
            var data = [];
            var json = {};
            var payments = [];
            var error = {};
            var iterator = payrollFile.lines.iterator();
            iterator.each(function (){ return false; }) // Para Saltar el header del CSV.
            iterator.each(function (line) {
                data = line.value.split(",");
                // log.debug("arreglo data nómina", data);
                for(i in data){
                    json[i] = data[i];
                }

                try{
                    log.debug("json", json)
                    var objRecord = record.create({
                        type: record.Type.CUSTOMER_PAYMENT,
                        isDynamic: true
                    });
                    var rut = json[5];
                    var resultSearch = nominas.searchAmount(rut);
                    log.debug("resultSearch", resultSearch);
                    objRecord.setValue({ fieldId: "customer", value: 42866 }); // 42866
                    objRecord.setValue({ fieldId: "trandate",value: format.parse({ value: new Date(), type: format.Type.DATE }) });
                    objRecord.setValue({ fieldId: "subsidiary",value: resultSearch[0].subsidiary }); // 5 -> pruebas desarrollo || 20 -> Proyectos y Servicios NetSuite
                    objRecord.setValue({ fieldId: "payment",value: resultSearch[0].amount }); // monto total del o los pagos.

                    // TODO insertar valor en campo ref doc del registro de pago.

                    // objRecord.setValue({ fieldId: " ?? ",value: " ?? " });
                    // var objRecordLine = objRecord.selectNewLine({ sublistId: 'apply' });
                    // objRecordLine.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'refnum', value: ?? });
                    // objRecordLine.commitLine({ sublistId: 'apply' });

                    var idRecordPago = objRecord.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: false
                    });
                    payments.push(idRecordPago);
                } catch(e){
                    // log.debug("Error en registro de pagos", e.message); 
                    error = {"error" : e.message}
                    payments.push(error);
                }
                return true;
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