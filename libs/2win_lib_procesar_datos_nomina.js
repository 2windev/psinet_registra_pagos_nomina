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

        function readPayrollFile(internalIdFile, extensionFile){
            var payrollFile = file.load({
                id: internalIdFile
            });
            var data = [];
            var json = {};
            var payments = [];
            var error = {};
            var rutCliente = 0;
            var nBoleta = 0;
            var iterator = payrollFile.lines.iterator();
            iterator.each(function (){ return false; }) // Para saltar la primera línea.
            iterator.each(function (line) {
                log.debug("extension Archivo", extensionFile);
                if(extensionFile === 'csv'){
                    data = line.value.split(",");
                    for(i in data){
                        json[i] = data[i];
                    }
                    rutCliente = json[5];
                    nBoleta = json[4];
                } else if(extensionFile === 'txt'){
                    data = line.value;
                    log.debug("data en read Payroll File", data);
                    var folio = "";
                    var rut = "";
                    for(var i = 0; i <= data.length; i++){
                        if(i >= 26 && i <= 35){
                            folio += data[i];
                        }
                        if(i >= 36 && i <= 47){
                            rut += data[i];
                        }
                    }
                    var rutSinDv = Number(rut.substring(0,rut.length-1));
                    var dv = rut.slice(-1);
                    rutCliente = rutSinDv + '-' + dv;                        
                    nBoleta = Number(folio);
                }
                
                try{
                    var resultSearch = nominas.searchAmount(rutCliente, nBoleta);
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