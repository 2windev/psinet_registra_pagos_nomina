/**
 * @NApiVersion 2.x
 * @module ./2win_lib_search_nominas_de_pago.js
 * @NModuleScope Public
 **/
define(['N/search'], 
    function(search){
        function searchPayroll(nameFile){
            var structureSearchPayroll = {
                type: "customrecord_2win_archivos_pago_proces",
                filters:[
                    ['name', 'is', nameFile]
                ],
                columns: [
                    search.createColumn({ name: "name", label: "name" })
                ]
            }
            return getDataSearch(structureSearchPayroll);
        }

        function searchCustomer(rut){
            var structureSearchCustomer = {
                type: search.Type.CUSTOMER,
                filters: [
                  ['custentity_2win_rut', 'is', rut]
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'internal_id' })
                ]
            }
            var idCustomer = getDataSearch(structureSearchCustomer);
            log.debug("Result search Customer", idCustomer);
            return idCustomer[0].internal_id;
        }

        function searchAmount(rut){
            try{
                var structureSearchAmount = {
                    type: search.Type.TRANSACTION,
                    filters:
                    [
                        ["type","anyof","VendBill","CustInvc"],
                        "AND",
                        ["subsidiary","anyof",5],
                        "AND",
                        ["custbody_2winrutapipos","is",rut],
                        "AND",
                        ["status","anyof","CustInvc:A"],
                        "AND",
                        ["mainline","is","T"]
                    ],
                    columns:
                    [
                        search.createColumn({name: "type", label: "type"}),
                        search.createColumn({name: "subsidiarynohierarchy", label: "subsidiary"}),
                        search.createColumn({name: "custbody_2winrutapipos", label: "rut"}),
                        search.createColumn({name: "tranid", label: "doc_number"}),
                        search.createColumn({name: "custbody_2winfolioacepta", label: "folio_acepta"}),
                        search.createColumn({name: "amount", label: "amount"}),
                        search.createColumn({name: "grossamount", label: "gross"}),
                        search.createColumn({name: "taxamount", label: "tax"})
                    ]
                }
                return getDataSearch(structureSearchAmount);
            } catch (e){
                log.debug("error - searchAmount", e.message)
            }
        }

        /**
         * @desc Devuelve todos los archivos de nóminas descargados en el directorio archivo_nomina
         * @function searchFilePayroll
         * @return Array getDataSearch()
         */
        function searchFilePayroll(){
            //TODO Se deberá implementar filtro para obtener archivos de nóminas especificos, ya sean estos, determinados por nombre o por fecha.
            try{
                var objSearch = {
                    type: 'file',
                    filters: [
                        ['folder', 'anyof', '3824'],
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid', label: 'internal_id' }),
                        search.createColumn({ name: 'name', sort: search.Sort.ASC, label: 'name' }),
                        search.createColumn({ name: 'filetype', label: 'file_type' })
                    ]
                }
                return getDataSearch(objSearch);
            } catch(e){
                log.error("Error en búsqueda de archivo", e.message)
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

    return {
        searchPayroll : searchPayroll,
        searchCustomer : searchCustomer,
        searchAmount : searchAmount,
        searchFilePayroll : searchFilePayroll
    }
});