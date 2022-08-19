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

        var searchCustomer = (rut) => {
            var structureSearchCustomer = {
                type: search.Type.CUSTOMER,
                filters: [
                  ['custentity_2win_rut', 'is', rut],
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'internal_id' }),
                    // search.createColumn({ name: 'custentity_2win_rut', label: "rut" }),
                    // search.createColumn({ name: 'entityid', sort: search.Sort.ASC, label: "name" })
                ]
            }
            var idCustomer = getDataSearch(structureSearchCustomer);
            log.debug("Result search Customer", idCustomer);
            return idCustomer[0].internal_id;
        }

        var searchAmount =(rut) =>{
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
        searchAmount : searchAmount
    }
});