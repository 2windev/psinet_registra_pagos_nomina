/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =\
 ||   This script is a tool to help develop SFTP connections      ||
 ||   in Suitescript 2.0                                          ||
 ||                                                               ||
 ||                                                               ||
 ||  Version Date         Author        Remarks                   ||
 ||  1.0     Oct 03 2016  Adolfo Garza  Initial commit            ||
 ||  1.1     Oct 11 2016  Adolfo Garza  Casting Port and Timeout  ||
 ||                                     to Number                 ||
 ||  1.2     Dec 23 2016  Adolfo Garza  Added support for HostKey ||
 ||                                     Port and Type             ||
  \= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
​
var HTTPSMODULE, SFTPMODULE, SERVERWIDGETMODULE,RECORD,TASK,SEARCH;
var HOST_KEY_TOOL_URL = 'https://ursuscode.com/tools/sshkeyscan.php?url=';​
/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 *@NModuleScope Public
 */
define(["N/https", "N/sftp", "N/ui/serverWidget","N/record","N/task", "N/search"], runSuitelet);​
//********************** MAIN FUNCTION **********************
function runSuitelet(https, sftp, serverwidget,record,task,search) {
    HTTPSMODULE = https;
    SERVERWIDGETMODULE = serverwidget;
    SFTPMODULE = sftp;​
    RECORD = record;
    TASK = task;
    SEARCH = search;
    var returnObj = {};
    returnObj.onRequest = execute;
    return returnObj;
}​
/**
     * @desc Obtener los datos de la busqueda
     * @function getDataSearch
     * @param String createSearch
     * @return searchResults
     */
    const getDataSearch = function(createSearch) {
        var searchResults = [];
  
        var saveSearch = SEARCH.create(createSearch);
  
        var searchResultCount = saveSearch.runPaged().count;
        if (searchResultCount == 0) {
            log.audit({ title: 'getDataSearch - Excepcion', details: 'Dato no Encontrado - Tabla: ' + createSearch.type });
            return searchResults;
        }
  
        saveSearch.run().each(function(item) {
            var objectCompiled = {};
            for (var i = 0; i < item.columns.length; i++) {
                objectCompiled[item.columns[i].label] = item.getValue(item.columns[i]);
            }
            searchResults.push(objectCompiled);
            return true;
        });
  
        return searchResults;
    }

  /**
     * @description Obtiene parámetros de facturación dese tabla customrecord_2w_parametros_facturacion.
     * @param {nonbre} nombre del parámetro a obtener.
     * @return Texto correspondiente al parámetro.
     */
    function getParametroFacturacion(nombre) {

        log.debug('getParametroFacturacion', nombre);
  
        var tabItem = {
            type: "customrecord_2w_parametros_facturacion",
            columns:
            [
                SEARCH.createColumn({name: "internalid", label: "id"}),
                SEARCH.createColumn({name: "custrecord_2w_facturacion_texto", label: "texto"})
            ],
            filters: [
                ["name", "is", nombre]
            ]
        }
        var result = getDataSearch(tabItem);
  
        if (result.length > 0) {
            return result[0].id;
        } else {
            throw new Error('No se encontro parametro facturacion para nombre : ' + nombre);
        }
    }  
  
function execute(context) {
    var method = context.request.method;​
    var form = getFormTemplate(method);​
    if (method == 'GET') {
        form = addSelectorFields(form);
    }​
    if (method == 'POST') {
        var selectaction = context.request.parameters.selectaction;
        if (selectaction == 'getpasswordguid') {
            form = addPasswordGUID1Fields(form);​
        } else if (selectaction == 'gethostkey') {
            form = addHostKeyFields(form);
        } else if (selectaction == 'downloadfile') {
            form = addDownloadFileFields(form);
        } else {
            var password = context.request.parameters.password;
            var username = context.request.parameters.username;
            var passwordGuid = context.request.parameters.passwordguid;
            var url = context.request.parameters.url;
            var hostKey = context.request.parameters.hostkey;
            var hostKeyType = context.request.parameters.hostkeytype;
            var port = context.request.parameters.port;
            var directory = context.request.parameters.directory;
            var timeout = context.request.parameters.timeout;
            var filename = context.request.parameters.filename;
            var restricttoscriptids = context.request.parameters.restricttoscriptids;
            var restricttodomains = context.request.parameters.restricttodomains;​
            if (restricttoscriptids && restricttodomains) {
                form = addPasswordGUID2Fields(form, restricttoscriptids, restricttodomains);
            }​
            if (password) {
                form.addField({
                    id: 'passwordguidresponse',
                    type: SERVERWIDGETMODULE.FieldType.LONGTEXT,
                    label: 'PasswordGUID Response',
                    displayType: SERVERWIDGETMODULE.FieldDisplayType.INLINE
                }).defaultValue = password;


                var idParametro = getParametroFacturacion('SFTP - passwordGuid')


                // var nuevoParametro = RECORD.submitFields({
                //     type: 'customrecord_2w_parametros_facturacion',
                //     id: idParametro ,
                //     values: {
                //         'custrecord_2w_facturacion_texto': password
                //     }
                // })


                var taskSendToSftp = TASK.create({
                    taskType: TASK.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_2winmapconnectionsftp',
                    deploymentId: 'customdeploy_2winmapconnection_sftp'
                });
                taskSendToSftp.submit();



                
            }​
            if (url && passwordGuid && hostKey && filename) {
                var sftpConnection = getSFTPConnection(username, passwordGuid, url, hostKey, hostKeyType, port, directory, timeout);
                var downloadedFile = sftpConnection.download({
                    filename: filename
                }).getContents();​
                form.addField({
                    id: 'filecontents',
                    type: SERVERWIDGETMODULE.FieldType.LONGTEXT,
                    label: 'File Contents',
                    displayType: SERVERWIDGETMODULE.FieldDisplayType.INLINE
                }).defaultValue = downloadedFile;
            } else if (url) {
                var myUrl = HOST_KEY_TOOL_URL + url + "&port=" + port + "&type=" + hostKeyType;
                var theResponse = HTTPSMODULE.get({ url: myUrl }).body;
                form.addField({
                    id: 'hostkeyresponse',
                    type: SERVERWIDGETMODULE.FieldType.LONGTEXT,
                    label: 'Host Key Response',
                    displayType: SERVERWIDGETMODULE.FieldDisplayType.INLINE
                }).defaultValue = theResponse;
            }
        }
    }​
    context.response.writePage(form);
    return;
}​
function addSelectorFields(form) {
    var select = form.addField({
        id: 'selectaction',
        type: SERVERWIDGETMODULE.FieldType.SELECT,
        label: 'Select Action'
    });
    select.addSelectOption({
        value: 'getpasswordguid',
        text: 'Get Password GUID',
    });
    select.addSelectOption({
        value: 'gethostkey',
        text: 'Get Host Key'
    });
    select.addSelectOption({
        value: 'downloadfile',
        text: 'Download File'
    });
    return form;
}​
function addPasswordGUID1Fields(form) {
    form.addField({
        id: 'restricttoscriptids',
        type: SERVERWIDGETMODULE.FieldType.TEXT,
        label: 'Restrict To Script Ids',
    }).isMandatory = true;
    form.addField({
        id: 'restricttodomains',
        type: SERVERWIDGETMODULE.FieldType.TEXT,
        label: 'Restrict To Domains',
    }).isMandatory = true;​
    return form;
}​
function addPasswordGUID2Fields(form, restrictToScriptIds, restrictToDomains) {
    form.addCredentialField({
        id: 'password',
        label: 'Password',
        restrictToScriptIds: restrictToScriptIds.replace(' ', '').split(','),
        restrictToDomains: restrictToDomains.replace(' ', '').split(','),
    });
    return form;
}​
function addHostKeyFields(form) {
    form.addField({
        id: 'url',
        type: SERVERWIDGETMODULE.FieldType.TEXT,
        label: 'URL (Required)',
    });​
    form.addField({
        id: 'port',
        type: SERVERWIDGETMODULE.FieldType.INTEGER,
        label: 'Port (Optional)',
    });​
    form.addField({
        id: 'hostkeytype',
        type: SERVERWIDGETMODULE.FieldType.TEXT,
        label: 'Type (Optional)',
    });
    return form;
}​
function addDownloadFileFields(form) {
    form.addField({
        id: 'url',
        type: SERVERWIDGETMODULE.FieldType.TEXT,
        label: 'URL (Required)',
    });
    form.addField({
        id: 'username',
        type: SERVERWIDGETMODULE.FieldType.TEXT,
        label: 'Username',
    });
    form.addField({
        id: 'passwordguid',
        type: SERVERWIDGETMODULE.FieldType.LONGTEXT,
        label: 'PasswordGuid (Required)',
    });
    form.addField({
        id: 'hostkey',
        type: SERVERWIDGETMODULE.FieldType.LONGTEXT,
        label: 'Host Key (Required)',
    });
    form.addField({
        id: 'hostkeytype',
        type: SERVERWIDGETMODULE.FieldType.TEXT,
        label: 'Host Key Type',
    });
    form.addField({
        id: 'filename',
        type: SERVERWIDGETMODULE.FieldType.TEXT,
        label: 'File Name',
    });
    form.addField({
        id: 'port',
        type: SERVERWIDGETMODULE.FieldType.INTEGER,
        label: 'Port',
    });
    form.addField({
        id: 'directory',
        type: SERVERWIDGETMODULE.FieldType.TEXT,
        label: 'Directory',
    });
    form.addField({
        id: 'timeout',
        type: SERVERWIDGETMODULE.FieldType.INTEGER,
        label: 'Timeout',
    });
    return form;
}​
function getFormTemplate() {
    var form = SERVERWIDGETMODULE.createForm({
        title: 'SFTP Helper Tool'
    });
    form.addSubmitButton({
        label: 'Submit'
    });​
    return form;
}​
function getSFTPConnection(username, passwordGuid, url, hostKey, hostKeyType, port, directory, timeout) {
    var preConnectionObj = {};
    preConnectionObj.passwordGuid = passwordGuid;
    preConnectionObj.url = url;
    preConnectionObj.hostKey = hostKey;
    if (username) { preConnectionObj.username = username; }
    if (hostKeyType) { preConnectionObj.hostKeyType = hostKeyType; }
    if (port) { preConnectionObj.port = Number(port); }
    if (directory) { preConnectionObj.directory = directory; }
    if (timeout) { preConnectionObj.timeout = Number(timeout); }​
    var connectionObj = SFTPMODULE.createConnection(preConnectionObj);
    return connectionObj;
}