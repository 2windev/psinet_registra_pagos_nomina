/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
 define(['N/search'], 

 function(search) {
 
     function _get(context) {
        try {
 
            log.debug("GET", context);
            var rutSinDv = context.rut.substring(0,context.rut.length-1);
            var dv = context.rut.slice(-1);
            var rut = rutSinDv + '-' + dv;
            log.debug("rutCliente", rut);
            var subsidiaria = context.sub;
            var resultSearchDebt = searchCustomerDebt(rut, subsidiaria);
            log.debug({ title: '@DomainSuccess', details: { "Deuda Cliente": resultSearchDebt } });
            if(!resultSearchDebt){
                return {
                    "code_error": "000",
                    "desc_error": "Deuda de Cliente",
                    "data": "Cliente sin deuda"
                };
            }
            return {
                "code_error": "000",
                "desc_error": "Deuda de Cliente",
                "data": resultSearchDebt
            };

        } catch (error) {
            log.error({ title: '@DomainError', details: JSON.stringify(error) });
            return {
                "code_error": "001",
                "desc_error": "Error en busqueda de deuda",
                "data": {}
            };
        }
     }
 
     function _post(context) {

     }
 
     function _put(context) {
         
     }
 
     function _delete(context) {
         
     }

     /**
     * @desc devuelve los pagos pendiente de un cliente especifico, determinado por su rut.
     * @function searchCustomerDebt
     * @return getDataSearch(structureCustomerDebt)
     */
    function searchCustomerDebt(rut, subsidiaria){
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
                    ["mainline","is","T"]
                ],
                columns:
                [
                    search.createColumn({name: "internalid", label: "internal_id"}),
                    search.createColumn({name: "subsidiarynohierarchy", label: "subsidiary"}),
                    search.createColumn({name: "tranid", label: "doc_number"}),
                    search.createColumn({name: "custbody_2winfolioacepta", label: "folio_acepta"}),
                    search.createColumn({name: "grossamount", label: "gross_amount"}),
                    search.createColumn({name: "custbody_2winfolioacepta", label: "descripcion"}),
                    search.createColumn({ name: 'duedate', label: "fecha_emision" })
                ]
            }
            return getDataSearch(structureCustomerDebt);
        } catch (e){
            log.debug("error - structureCustomerDebt", e.message)
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
         get: _get,
        //  post: _post,
        //  put: _put,
        //  delete: _delete
     }
     
 });
 