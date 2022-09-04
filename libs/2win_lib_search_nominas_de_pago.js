/**
 * @NApiVersion 2.x
 * @module ./2win_lib_search_nominas_de_pago.js
 * @NModuleScope Public
 **/
define(['N/search'], 
    function(search){
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

        /**
         * @desc devuelve los pagos pendiente de un cliente especifico, determinado por su rut.
         * @function searchCustomerDebt
         * @return getDataSearch(structureCustomerDebt)
         */
        function searchCustomerDebt(rut, nBoleta){
            try{
                var structureCustomerDebt = {
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
        searchCustomerDebt : searchCustomerDebt,
        searchFilePayroll : searchFilePayroll
    }
});