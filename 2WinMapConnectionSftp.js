/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/sftp', 'N/runtime', './libs/2WinArchivo-v2.0', './libs/2WinUtilityStaticParams'],
    function(search, sftp, runtime, archivo, staticParams) {

        // define(['N/search', 'N/sftp', 'N/runtime'],
        // function(search, sftp, runtime) {

        var paramConnect = {
            username: staticParams.getParam('SFTP - username').text,
            passwordGuid: staticParams.getParam('SFTP - passwordGuid').text,
            url: staticParams.getParam('SFTP - url').text,
            directory: staticParams.getParam('SFTP - directory Root').text,
            port: Number(staticParams.getParam('SFTP - port').number),
            hostKey: staticParams.getParam('SFTP - hostKey').text,
            hostKeyType: staticParams.getParam('SFTP - hostKeyType').text
        }

        var directoryUpload = staticParams.getParam('SFTP - directory Upload').text;

        log.audit({
            title: 'Prueba de parametros',
            details: '...'
        });

        var idfile = runtime.getCurrentScript().getParameter("custscript_2win_idfile_dte");
            log.audit({ title: 'uploadFileSftp idfile', details: idfile});

            var idfolios = runtime.getCurrentScript().getParameter("custscript_idfolios");
            log.audit({ title: 'idFolios', details: idfolios});

        var directorioDestino = runtime.getCurrentScript().getParameter("custscript_2win_dir_destino");
            log.audit({ title: 'uploadFileSftp directorio', details: directorioDestino});

            var folios = runtime.getCurrentScript().getParameter("custscript_carga_folios");
            log.audit({ title: 'uploadFileSftp folios', details: folios});


       

        const setConnection = function() {
            try {
                log.audit({
                    title: 'setConnection - paramConnect',
                    details: paramConnect
                });

                var connectSftp = sftp.createConnection(paramConnect);

            } catch (e) {
                log.error({
                    title: 'setConnection - Error de Coneccion',
                    details: e
                });
                return null;
            }

            log.debug({
                title: 'setConnection',
                details: 'Connection Success..!!'
            });

            return connectSftp;
        }

        const uploadFileSftp = function(idFileUp, connectSftp, directorioDestino) {
            try {

                if (directorioDestino != null) {
                    log.audit({ title: 'uploadFileSftp', details: 'Se obtiene directorio destino desde parámetro (custscript_2win_dir_destino)' });
                    directoryUpload = directorioDestino;
                }

                var fileObject = archivo.getFileObject(idFileUp)
                var paramUpload = {
                    directory: directoryUpload,
                    filename: fileObject.name,
                    file: fileObject,
                    replaceExisting: true
                };

                log.audit({
                    title: 'Parmetros de subida',
                    details: paramUpload
                })

                connectSftp.upload(paramUpload);
            } catch (e) {
                log.audit({ title: 'uploadFileSftp - Excepcion', details: e });
                return null;
            }

            log.debug({ title: 'uploadFileSftp', details: 'Upload Success..!! (File Name: ' + fileObject.name + ')' });
        }

        function getInputData() { 
            
            log.audit({ title: 'uploadFileSftp', details: 'Subiendo archivo a sftp 2win.' });
            

            var connectSftp = setConnection();
            if(idfile !=null){
                log.audit({
                    title: "Subiendo archivo",
                    details: 'subiendo archivo...'
                })
                uploadFileSftp(idfile, connectSftp, directorioDestino);
            }else if ( folios !=null  ){
                var directorio = staticParams.getParam('folios').text
                log.audit({
                    title: "Directorio de carga de folios",
                    details: directorio
                });
                log.audit({
                    title: "Subiendo archivo",
                    details: 'subiendo archivo...'
                })
                uploadFileSftp(idfolios, connectSftp, directorio);
            }

            return 'ok';
        }

        function map(context) { 
            log.audit({ title: 'map', details: JSON.stringify(context) });
        }

        function summarize(summary) { 
            log.audit({ title: 'summarize - summary', details: JSON.stringify(summary) });
        }

        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        };
    }
);