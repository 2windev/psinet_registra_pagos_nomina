/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet   
*/
 define(['N/ui/serverWidget'],

    function(serverWidget) {

        function onRequest(context) {
            if(context.request.method == 'GET'){
                //TODO carga de archivo csv en netsuite.
                let field = form.addField({
                    id: 'textfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Carga Pago de Nómina'
                });
            }
        }

        return {
            onRequest: onRequest
        };
     }
);