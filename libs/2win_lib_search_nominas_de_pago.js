/**
 * @NApiVersion 2.x
 * @module ./2win_lib_search_nominas_de_pago.js
 * @NModuleScope Public
 **/
define(['N/search', './2WinStaticParamsFacturacion.js'], 
    function(search, paramsFact){
        /**
         * @desc Búsqueda para válidar si nómina de pago ya fue procesada con anterioridad, si existe devolvera el internal id, si no, devolvera false.
         * @function searchFilePayroll
         * @return Array getDataSearch()
         */
        function searchPayroll(nameFile){
            var structureSearchPayroll = {
                type: "customrecord_2win_archivos_pago_proces",
                filters:[
                    ['name', 'is', nameFile]
                ],
                columns: [
                    search.createColumn({ name: "internalid", label: "internal_id" })
                ]
            }
            return getDataSearch(structureSearchPayroll);
        }
        /**
         * @desc devuelve el internal_id de un cliente especifico, determinado por el rut.
         * @function searchCustomer
         * @return String internal_id
         */
        function searchCustomer(rut){
            try{
                var structureSearchCustomer = {
                    type: "customer",
                    filters: [
                      ['custentity_2wrut', 'is', rut]
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid', label: 'internal_id' })
                    ]
                }
                var idCustomer = getDataSearch(structureSearchCustomer);
                log.debug("idCustomer", idCustomer);
                return idCustomer
            } catch(e){
                log.debug("Error searchCustomer", e.message);
            }
            
        }

        /**
         * @desc devuelve los pagos pendiente de un cliente especifico, determinado por su rut.
         * @function searchCustomerDebt
         * @return getDataSearch(structureCustomerDebt)
         */
        function searchCustomerDebt(rut, nBoleta, subsidiaria){
            try{
                var structureCustomerDebt = {
                    type: search.Type.TRANSACTION,
                    filters: 
                        [
                            ["type","anyof","VendBill","CustInvc"],
                            "AND",
                            ["subsidiary","anyof",subsidiaria],
                            "AND",
                            ["customermain.custentity_2wrut","is",rut],
                            "AND",
                            ["status","anyof","CustInvc:A"],
                            "AND",
                            ["mainline","is","T"],
                            "AND", 
                            ["custbody_2winfolioacepta","equalto",nBoleta]
                        ],
                    columns:
                    [
                        search.createColumn({name: "internalid", label: "internal_id"}),
                        search.createColumn({name: "subsidiarynohierarchy", label: "subsidiary"}),
                        search.createColumn({name: "tranid", label: "doc_number"}),
                        search.createColumn({name: "custbody_2winfolioacepta", label: "folio_acepta"}),
                        search.createColumn({name: "grossamount", label: "gross_amount"})
                    ]
                }
                return getDataSearch(structureCustomerDebt);
            } catch (e){
                log.debug("error - structureCustomerDebt", e.message)
            }
        }

        /**
         * @desc Devuelve todos los archivos de nóminas descargados en el directorio archivo_nomina
         * @function searchFilePayroll
         * @return Array getDataSearch()
         */
        function searchFilePayroll(){
            try{
                var idFolder = paramsFact.getParam('pago_nominas_id_folder_archivo_nomina').text;
                var objSearch = {
                    type: 'file',
                    filters: [
                        ['folder', 'is', idFolder],
                        'AND',
                        ['name', 'haskeywords', '*.txt'],
                        'OR',
                        ['name', 'haskeywords', '*.csv']
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid', label: 'internal_id' }),
                        search.createColumn({ name: 'name', sort: search.Sort.ASC, label: 'name' }),
                        search.createColumn({ name: 'filetype', label: 'file_type' })
                    ]
                }
                return getDataSearch(objSearch);
            } catch(e){
                log.debug("Error en búsqueda de archivo", e.message)
            }
         }

    /**
     * @desc Obtener datos según estructura de busqueda
     * @function getDataSearch
     * @param String createSearch
     * @return Array searchResults
     */
     function getDataSearch(createSearch){
        var searchResults = [];
        var saveSearch = search.create(createSearch);
        var searchResultCount = saveSearch.runPaged().count;
        if (searchResultCount == 0) {
            return false;
        }
        saveSearch.run().each(function (item) {
            var objectCompiled = {};
            for (var i = 0; i < item.columns.length; i++) {
                objectCompiled[item.columns[i].label] = item.getValue(item.columns[i]);
            }
            searchResults.push(objectCompiled);
            return true;
        });
        return searchResults;
    };

    function searchPaymentMedia(){
        var objSearch = {
            type: 'customrecord_2win_parametros_pago_psinet',
            filters: [],
            columns: [
                search.createColumn({ name: 'custrecord1473_2', label: 'name' }),
                search.createColumn({ name: 'custrecord1474_2', label: 'id_forma_pago' })
            ]
        }

        return getDataSearch(objSearch);

    }

    return {
        searchPayroll : searchPayroll,
        searchCustomer : searchCustomer,
        searchCustomerDebt : searchCustomerDebt,
        searchFilePayroll : searchFilePayroll,
        searchPaymentMedia : searchPaymentMedia
    }
});
