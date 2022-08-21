/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
// define(['N/search', 'N/record', 'N/sftp', 'SuiteScripts/2Win/2WinArchivo-v2.0', './2WinUtilityStaticParams'],
//     function(search, record, sftp, archivo, staticParams) {
define(['N/search', 'N/record', 'N/sftp'],
    function(search, record, sftp) {​
        // var paramConnect = {
        //     username: staticParams.getParam('SFTP - username').text,
        //     passwordGuid: '6a54dc76a99f4ef386fdd1d37ce2972e',
        //     url: staticParams.getParam('SFTP - url').text,
        //     directory: staticParams.getParam('SFTP - directory Root').text,
        //     port: Number(staticParams.getParam('SFTP - port').number),
        //     hostKey: staticParams.getParam('SFTP - hostKey').text,
        //     hostKeyType: staticParams.getParam('SFTP - hostKeyType').text
        // }var paramConnect = {

        var paramConnect = {
            username: "factfiles",
            passwordGuid: "0e271703d5c447959ef2a030eca791b5",
            url: "104.248.58.42",
            directory: "/resultados",
            port: 22,
            hostKey: "AAAAB3NzaC1yc2EAAAADAQABAAABAQDOmZUshBlyOETQ/LYLAcH2dzkxo9Rkp0xFOXPJyoKFbZigPCiOexiFxy5qPtz9X8wLQwI0DwZqfOBNdRegec4tdG0fd2vO7qP7SMm7uOZ5Yy0Zi64F0uh6vBcNWPWynEAGLNB9vg7V+NJj/d2DMSkiWJh+R9YHDEqz0MYRA7goT/33aqJwmPF3ob54fjJHEAUqsZ0W3FfYMomb+b5l4eFwCjkGxREsdtpvWmS3hNkt1MY1Wr7Bd6Moc7Rru6tjnBRTT4MFZ+UKeC5lRuM/v2r+K1Y1lQWdErXFTgcPrEGg7LCDSqndlKOD8YoR5bwOjbICP52nr23SY3g/aETjtUMZ",
            hostKeyType: "rsa"
        }
        var directoryUpload = "/";

        ​
        const setConnection = function(paramConnect) {
            try {
                log.audit({
                    title: 'setConnection - paramConnect',
                    details: paramConnect
                });​
                var connectSftp = sftp.createConnection(paramConnect);​
            } catch (e) {
                log.error({
                    title: 'setConnection - Error de Coneccion',
                    details: e
                });
                return null;
            }​
            log.debug({
                title: 'setConnection',
                details: 'Connection Success..!!'
            });​
            return connectSftp;
        }​​​
        function execute(context) {
            var connectSftp = setConnection(paramConnect);
        }​
        return {
            execute: execute
        };
    });