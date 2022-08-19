/**
 * Herramienta de Conexion y Transferencia de Archivos a traves del protocolo SFTP.
 * @NApiVersion 2.x
 * @NModuleScope Public
 * 
 * @author          Javier Briceño <javier.briceno@2win.cl>
 * @copyright       2WIN
 **/

define(['N/sftp', './2WinArchivo-v2.0'],
    function(sftp, archivo) {

        const setConnection = function(paramConnect) {
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

        const uploadFileSftp = function(idFileUp, directoryUp, connectSftp) {
            try {
                var fileObject = archivo.getFileObject(idFileUp)

                var paramUpload = {
                    directory: directoryUp,
                    filename: fileObject.name,
                    file: fileObject,
                    replaceExisting: true
                }

                connectSftp.upload(paramUpload);
            } catch (e) {
                log.audit({
                    title: 'uploadFileSftp - Excepcion',
                    details: e
                });
                return null;
            }

            log.debug({
                title: 'uploadFileSftp',
                details: 'Upload Success..!! (File Name: ' + fileObject.name + ')'
            });
        }

        const dowloadFileSftp = function(nombreArchivoDown, directoryDonw, nameFolderSave, connectSftp) {
            try {
                var idFolder = archivo.getFolderIdByName(nameFolderSave);
                log.audit({ title: 'idfolder', details: idFolder });
                
                var downloadedFile = connectSftp.download({
                    directory: directoryDonw,
                    filename: nombreArchivoDown
                });

                downloadedFile.folder = idFolder;

                return downloadedFile.save();

            } catch (e) {
                log.debug({
                    title: 'dowloadFileSftp - Error',
                    details: e
                });
                return null
            }
        }

        return {
            setConnection: setConnection,
            uploadFileSftp: uploadFileSftp,
            dowloadFileSftp: dowloadFileSftp
        }
    }
);