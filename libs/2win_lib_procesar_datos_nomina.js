/**
 * @NApiVersion 2.x
 * @module ./2win_lib_procesar_datos_nomina.js
 * @NModuleScope Public
 **/
define(['N/file', 'N/record', './2win_lib_search_nominas_de_pago.js'],
    function (file, record, nominas) {

        /**
         * @desc Devuelve el id del registro de nómina grabada en la tabla personalizada.
         * @function registerPayroll
         * @return Integer idRecord
         */
        function registerPayroll(datosNomina) {
            var objRecord = record.create({
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
        function readPayrollFile(internalIdFile, typeFile, medioPago, subsidiaria) {
            var payrollFile = file.load({
                id: internalIdFile
            });
            var data = [];
            var json = {};
            var payments = [];
            var rutCliente = 0;
            var nBoleta = 0;
            var iterator = payrollFile.lines.iterator();
            log.debug("size archivo", payrollFile.size)
            if (payrollFile.size < 10485760) {  // Tamaño de archivo en byte debe ser menor a 10mb.
                try {
                    if (typeFile === 'pacpat' || typeFile === 'servipag') {
                        iterator.each(function () { return false; }) // Para saltar la primera línea.
                    }
                    iterator.each(function (line) {

                        if (typeFile === 'pacpat') {
                            data = line.value.split(",");
                            for (i in data) {
                                json[i] = data[i];
                            }
                            rutCliente = json[5];
                            nBoleta = json[4];
                            log.debug("rut Cliente", rutCliente);
                            log.debug("Numero Boleta", nBoleta);
                            payments.push(registerPayments(rutCliente, nBoleta, medioPago, subsidiaria));

                        } else if (typeFile === 'servipag') {
                            data = line.value;
                            var folio = "";
                            var rut = "";
                            for (var i = 0; i <= data.length; i++) {
                                if (i >= 26 && i <= 35) {
                                    folio += data[i];
                                }
                                if (i >= 36 && i <= 47) {
                                    rut += data[i];
                                }
                            }
                            var rutSinDv = Number(rut.substring(0, rut.length - 1));
                            var dv = rut.slice(-1);
                            rutCliente = rutSinDv + '-' + dv;
                            nBoleta = Number(folio);
                            log.debug("rut Cliente", rutCliente);
                            log.debug("Numero folio", nBoleta);
                            payments.push(registerPayments(rutCliente, nBoleta, medioPago, subsidiaria));

                        } else if (typeFile === 'cajavecina') {
                            data = line.value;
                            log.debug("data en read Payroll File", data);
                            var monto = "";
                            var rut = "";
                            for (var i = 0; i <= data.length; i++) {
                                if (i >= 0 && i <= 14) {
                                    rut += data[i];
                                }
                                if (i >= 156 && i <= 169) {
                                    monto += data[i];
                                }
                            }
                            var rutSinDv = Number(rut.substring(0, rut.length - 1));
                            var dv = rut.slice(-1);
                            rutCliente = rutSinDv + '-' + dv;
                            nBoleta = Number(monto);
                            log.debug("rut cliente - cajavecina", rutCliente);
                            log.debug("monto - cajavecina", nBoleta);
                            var idRecordDeposit = registerCustomerDeposit(rutCliente, nBoleta, medioPago, subsidiaria);
                            log.debug("idRecordDeposit", idRecordDeposit)
                            if (!idRecordDeposit) {
                                payments.push({ "error": "Error al registrar depósito de cliente " });
                            } else {
                                var recordDepositApplication = record.transform({
                                    fromType: record.Type.CUSTOMER_DEPOSIT,
                                    fromId: idRecordDeposit,
                                    toType: record.Type.DEPOSIT_APPLICATION,
                                    isDynamic: true
                                });
                                var lines = recordDepositApplication.getLineCount({ sublistId: 'apply' });
                                for (var i = 0; i < lines; i++) {
                                    recordDepositApplication.selectLine({ sublistId: 'apply', line: i });
                                    recordDepositApplication.setCurrentSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'apply',
                                        value: true,
                                        ignoreFieldChange: false
                                    });
                                };
                                recordDepositApplication.commitLine({ sublistId: 'apply' });
                                var idDepositApp = recordDepositApplication.save();
                                log.debug("idDepositApp", idDepositApp);
                                payments.push(idDepositApp);
                            }
                        }
                        return true;
                    });
                } catch (e) {
                    var error = {};
                    error["error nómina " + typeFile] = e.message;
                    payments.push(error);
                }

            } else {
                var error = {};
                error = { "error": "Archivo pesa más de 10mb" };
                payments.push(error);
            }
            return payments;
        }

        /**
         * @desc se crea registro de tipo pago en tabla de transacción para nóminas de tipo pat-pac y servipag.
         * @function registerPayments
         * @return Integer idRecordPago
         */
        function registerPayments(rutCliente, nBoleta, medioPago, subsidiaria) {
            var resultSearch = nominas.searchCustomerDebt(rutCliente, nBoleta, subsidiaria);
            if (resultSearch == false) {
                log.debug("Búsqueda de deuda de cliente", "cliente sin deuda");
                return "No se encontró deuda asociado al cliente: " + rutCliente;
            }
            var error = {};
            try {
                var internalIdDeuda = resultSearch[0].internal_id;
                log.debug("internalIdDeuda", internalIdDeuda);
                if (internalIdDeuda === false) {
                    var message = "no existe deuda asociada a cliente :" + rutCliente;
                    error = { "error": message }
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

                objRecord.setValue({ fieldId: "paymentoption", value: medioPago });
                var idRecordPago = objRecord.save({
                    isDynamic: true,
                    ignoreMandatoryFields: true
                });
                return "Cliente: " + rutCliente + " - id deuda: " + internalIdDeuda + " - id pago: " + idRecordPago;
            } catch (e) {
                log.debug("Error Al intentar registrar pago", e.message);
                error = { "error": e.message };
                return error;
            }
        }

        /**
         * @desc se crea registro de tipo depósito de cliente en tabla de transacción para nóminas de tipo caja vecina.
         * @function registerCustomerDeposit
         * @return Integer idRecordDeposit
         */
        function registerCustomerDeposit(rutCliente, amount, medioPago, subsidiaria) {
            try {
                var internalIdCustomer = nominas.searchCustomer(rutCliente)[0].internal_id;
                var objRecordDeposit = record.create({
                    type: "customerdeposit",
                    isDynamic: true
                });
                // log.debug("objRecordDeposit", objRecordDeposit);
                objRecordDeposit.setValue({ fieldId: 'customer', value: internalIdCustomer });
                objRecordDeposit.setValue({ fieldId: 'payment', value: amount });
                objRecordDeposit.setValue({ fieldId: 'subsidiary', value: subsidiaria });
                objRecordDeposit.setValue({ fieldId: "paymentoption", value: medioPago });

                var idRecordDeposit = objRecordDeposit.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                return idRecordDeposit;
            } catch (error) {
                log.debug("Error en la aplicación de deposito", error.message);
            }

        }

        return {
            readPayrollFile: readPayrollFile,
            registerPayroll: registerPayroll
        };

    });