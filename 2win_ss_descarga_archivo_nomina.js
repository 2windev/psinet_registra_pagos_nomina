/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['./libs/2WinConexionSftp', './libs/2WinUtilityStaticParams'], 

function(sftp, staticParams) {

    var paramConnect = {
        username: staticParams.getParam('SFTP - username').text,
        passwordGuid: 'bfe8349be9754672876a432eea4a38be', //passwordGuid: staticParams.getParam('SFTP - passwordGuid').text,
        url: staticParams.getParam('SFTP - url').text,
        directory: staticParams.getParam('SFTP - directory Root').text,
        port: Number(staticParams.getParam('SFTP - port').number),
        hostKey: staticParams.getParam('SFTP - hostKey').text,
        hostKeyType: staticParams.getParam('SFTP - hostKeyType').text
    }

    function execute(context) {
        
        try {

            log.debug("Descarga Archivo Nómina", "**** INICIA DESCARGA ****");

            var connectSftp  = sftp.setConnection(paramConnect);

            var folderNameDownload = "/resultados";
            var fileNameDownload = "pago_pat_pac.csv";            
            log.debug("Descarga Archivo Nómina - Archivo a Descargar", folderNameDownload + "/" + fileNameDownload);

            var folderNameTarget = "archivo_nomina";
            log.debug("Descarga Archivo Nómina - Carpeta Destino", folderNameTarget);

            var fileId = sftp.dowloadFileSftp(fileNameDownload, folderNameDownload, folderNameTarget, connectSftp);

            log.debug("Descarga Archivo Nómina - Id Archivo Registrado", fileId);

            log.debug("Descarga Archivo Nómina", "**** FIN DESCARGA ****");
            
        } catch (error) {
            log.error("Descarga Archivo Nómina - Error", error);
        }
    }

    return {
        execute: execute
    }
});
