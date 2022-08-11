/**
 * @NApiVersion 2.x
 * @module ./2win_lib_search_nominas_de_pago.js
 * @NModuleScope Public
 **/
define(['N/search'], 
    function(search){
        var searchPayroll = () => {
            var structureSearchPayroll = {
                type: "customrecord_2win_regist_nominas_de_pago",
                columns: [
                    search.createColumn({ name: "internalid", label: "internal_id" }),
                    search.createColumn({ name: "custrecord_user", label: "user" }),
                    search.createColumn({ name: "custrecord_name_file", label: "name_file" }),
                    search.createColumn({ name: "custrecord_date_time", label: "date_time" }),
                    search.createColumn({ name: "custrecord_state", label: "state" }),
                ]
            }
            return getDataSearch(structureSearchPayroll);
        }

        var searchCustomer = (name) => {
            var structureSearchCustomer = {
                type: search.Type.CUSTOMER,
                filters: [
                  ['entityid', 'is', name],
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'internal_id' }),
                    search.createColumn({ name: 'entityid', sort: search.Sort.ASC, label: "name" })
                ]
            }
            var result = getDataSearch(structureSearchCustomer);
            var idCustomer;
            for(i in result){
                if(result[i].name === name ){
                    idCustomer = result[i].internal_id;
                }
            }
            return idCustomer;
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
        searchCustomer : searchCustomer
    }
});