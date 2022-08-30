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
            iterator.each(function (){ return false; }) // Para saltar el header del CSV.
            iterator.each(function (line) {
                data = line.value.split(",");
                for(i in data){
                    json[i] = data[i];
                }
                try{
                    log.debug("json", json)
                    var rut = json[5];
                    var nBoleta = json[4];
                    var resultSearch = nominas.searchAmount(rut, nBoleta);
                    log.debug("resultSearch",resultSearch);

                    // Transformación de registro invoice a customer_payment
                    var factura2Pago = record.transform({
                        fromType: record.Type.INVOICE,
                        fromId: resultSearch[0].internal_id,
                        toType: record.Type.CUSTOMER_PAYMENT,
                        isDynamic: true,
                        ignoreMandatoryFields: true
                    });
                    var pago_realizado = factura2Pago.save();
                    log.debug("transform", pago_realizado);

                    var objRecord = record.load({
                        type: record.Type.CUSTOMER_PAYMENT,
                        id: pago_realizado,
                        isDynamic: true
                    });
                    objRecord.setValue({ fieldId: "paymentoption", value: 14 });
                    var idRecordPago = objRecord.save({
                        isDynamic: true,
                        ignoreMandatoryFields: true
                    });
                    
                    log.debug("Actualización registro pago", idRecordPago);
                    payments.push(idRecordPago);
                } catch(e){
                    error = {"error" : e.message}
                    payments.push(error);
                }
                return true;
            });
            return payments;
        }
        return {
            readPayrollFile : readPayrollFile,
            registerPayroll : registerPayroll
        };
    
});