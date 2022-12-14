/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['./libs/2WinConexionSftp', './libs/2WinStaticParamsFacturacion', 'N/record', 'N/format', 'N/runtime'], 

function(sftp, params, record, format, runtime) {

    var paramConnect = {
        username: params.getParam('sftp_origen_username').text,
        passwordGuid: params.getParam('sftp_origen_passwordguid').text, 
        url: params.getParam('sftp_origen_url').text,
        directory: params.getParam('sftp_origen_directoryroot').text,
        port: Number(params.getParam('sftp_origen_port').number),
        hostKey: params.getParam('sftp_origen_hostkey').text,
        hostKeyType: params.getParam('sftp_origen_hostkeytype').text
    }

    function execute(context) {

        var fileNameDownload = "";
        
        try {

            log.debug("Descarga Archivo Nómina", "**** INICIA DESCARGA ****");

            // Crear conexión a servidor SFTP
            var connectSftp  = sftp.setConnection(paramConnect);
            var fecha = new Date();
            // pago_pat_pac.csv
            var filesName = [
                "patpac_" + fecha.getFullYear() + (fecha.getMonth() + 1) + fecha.getDate() + ".csv",
                "servipag_" + fecha.getFullYear() + (fecha.getMonth() + 1) + fecha.getDate() + ".txt",
                "cajavecina_" + fecha.getFullYear() + (fecha.getMonth() + 1) + fecha.getDate() + ".txt"
            ]

            // Iterar los archivos que se deben descargar
            filesName.forEach(function (fileName) {

                fileNameDownload = fileName;

                var folderNameDownload = "/resultados";     
                log.debug("Descarga Archivo Nómina - Archivo a Descargar", folderNameDownload + "/" + fileNameDownload);

                var folderNameTarget = "archivo_nomina";
                log.debug("Descarga Archivo Nómina - Carpeta Destino", folderNameTarget);

                try {

                    var fileId = sftp.dowloadFileSftp(fileNameDownload, folderNameDownload, folderNameTarget, connectSftp);

                    log.debug("Descarga Archivo Nómina - Id Archivo Registrado", fileId);

                    saveProcess(fileNameDownload, "Descargado", "Archivo id " + fileId + " descargado correctamente");
                    
                } catch (error) {
                    if (error.name == "FTP_NO_SUCH_FILE_OR_DIRECTORY") {
                        log.error("Descarga Archivo Nómina - No Encontrado", error.message);
                        saveProcess(fileNameDownload, "No Encontrado", error.message);
                    } else {                        
                        throw error;
                    }                    
                }                
                
            });

            log.debug("Descarga Archivo Nómina", "**** FIN DESCARGA ****");
            
        } catch (error) {
            log.error("Descarga Archivo Nómina - Error", error);
            saveProcess(fileNameDownload, "Error de Conexión", error.message);      
        }
    }

    return {
        execute: execute
    }
    
    function saveProcess(file, state, message) {
        
        var nominaRecord = record.create({ type: 'customrecord_2win_regist_nominas_de_pago', isDynamic: true });
        nominaRecord.setValue({ fieldId: 'custrecord_name_file', value: file });
        nominaRecord.setValue({ fieldId: 'custrecord_date_time', value: format.parse({ value: new Date(), type: format.Type.DATE }) });
        nominaRecord.setValue({ fieldId: 'custrecord_state', value: state });
        nominaRecord.setValue({ fieldId: 'custrecord_user', value: runtime.getCurrentUser().name });
        nominaRecord.setValue({ fieldId: 'custrecord_2win_observacion', value: message });
        nominaRecord.save();
    }
});
