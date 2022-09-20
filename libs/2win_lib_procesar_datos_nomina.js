/**
 * @NApiVersion 2.x
 * @module ./2win_lib_procesar_datos_nomina.js
 * @NModuleScope Public
 **/
define(['N/file', 'N/record', './2win_lib_search_nominas_de_pago.js', 'N/format', './2WinUtilityStaticParams.js', 'N/xml'], 
    function(file, record, nominas, format, params, xml) {

        /**
         * @desc Devuelve el id del registro de nómina grabada en la tabla personalizada.
         * @function registerPayroll
         * @return Integer idRecord
         */
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

        /**
         * @desc lee el contenido de las nóminas y realiza la trasacción de acuerdo al tipo de nómina.
         * @function readPayrollFile
         * @return array payments
         */
        function readPayrollFile(internalIdFile, typeFile){
            var payrollFile = file.load({
                id: internalIdFile
            });
            log.debug("payrollFile - file", payrollFile);
            var data = [];
            var json = {};
            var payments = [];
            var rutCliente = 0;
            var nBoleta = 0;
            var iterator = payrollFile.lines.iterator();
            if(typeFile === 'PATPAC'){
                iterator.each(function (){ return false; }) // Para saltar la primera línea.
            }
            log.debug("size archivo", payrollFile.size)
            if(payrollFile.size <= 10000000){  // Tamaño de archivo en byte debe ser menor a 10mb.
                iterator.each(function(line) {
                    log.debug("tipo de Archivo", typeFile);
                    if(typeFile === 'PATPAC'){
                        data = line.value.split(",");
                        for(i in data){
                            json[i] = data[i];
                        }
                        rutCliente = json[5];
                        nBoleta = json[4];
                        payments.push(registerPayments(rutCliente, nBoleta));
    
                    } else if(typeFile === 'SERVIPAG'){
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
                        payments.push(registerPayments(rutCliente, nBoleta));
    
                    } else if(typeFile === 'CAJAVECINA'){
                        data = line.value;
                        log.debug("data en read Payroll File", data);
                        var monto = "";
                        var rut = "";
                        for(var i = 0; i <= data.length; i++){
                            if(i >= 0 && i <= 14){
                                rut += data[i];
                            }
                            if(i >= 156 && i <= 171){
                                monto += data[i];
                            }
                        }
                        var rutSinDv = Number(rut.substring(0,rut.length-1));
                        var dv = rut.slice(-1);
                        rutCliente = rutSinDv + '-' + dv;                        
                        nBoleta = Number(monto);
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
                        payments.push(idDepositApp);
                    }                    
                });
            } else {
                var error = {};
                error = {"error" : "Archivo pesa más de 10mb"};
                payments.push(error);
            }
            
            return payments;
        }

        /**
         * @desc se crea registro de tipo pago en tabla de transacción para nóminas de tipo pat-pac y servipag.
         * @function registerPayments
         * @return Integer idRecordPago
         */
        function registerPayments(rutCliente, nBoleta){
            var resultSearch = nominas.searchCustomerDebt(rutCliente, nBoleta);
            var error = {};
                try{
                    var internalIdDeuda = resultSearch[0].internal_id;
                    if(internalIdDeuda === false){
                        var message = "no existe deuda asociada a cliente.";
                        error = {"error" : message}
                        payments.push(error);
                        return message;
                    }
                    // Transformación de registro invoice a customer_payment
                    var factura2Pago = record.transform({
                        fromType: record.Type.INVOICE,
                        fromId: internalIdDeuda,
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
                    return idRecordPago;
                } catch(e){
                    error = {"error" : e.message};
                    return error;
                }
        }

        /**
         * @desc se crea registro de tipo aplicación de desposito en tabla de transacción para nóminas de tipo caja vecina.
         * @function registerDepositApplicated
         * @return Integer idRecordDeposit
         */
        function registerDepositApplicated(rutCliente, amount){
            var internalIdCustomer = nominas.searchCustomer(rutCliente);
            // TODO crear transacción de tipo "Deposito de cliente"
            var objRecordDeposit = record.create({
                type: "customerdeposit",
                isDynamic: true
            });
            log.debug("objRecordDeposit", objRecordDeposit);
            objRecordDeposit.setValue({ fieldId: 'customer', value: internalIdCustomer });
            objRecordDeposit.setValue({ fieldId: 'payment', value: amount });
            objRecordDeposit.setValue({ fieldId: 'subsidiary', value: 5 });

            var idRecordDeposit = objRecordDeposit.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            return idRecordDeposit;
        }

        return {
            readPayrollFile : readPayrollFile,
            registerPayroll : registerPayroll
        };
    
});