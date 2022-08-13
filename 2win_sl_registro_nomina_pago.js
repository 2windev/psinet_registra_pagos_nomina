/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet   
*/
 define(['N/runtime', 'N/record', 'N/format', './libs/2win_lib_search_nominas_de_pago.js', './libs/2win_lib_procesar_datos_nomina.js'],

    function(runtime, record, format, nominas, process) {

        function onRequest(context) {
            var bootstrap = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">';
            var scriptsBootstrap = `
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js" integrity="sha384-7+zCNj/IqJ95wo16oMtfsKbZ9ccEh31eOz1HGyDuCQ6wgnyJNSYdrPa03rtR1zdB" crossorigin="anonymous"></script>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js" integrity="sha384-QJHtvGhmr9XOIpI6YVutG+2QOK9T+ZnN4kzFN1RtK3zEFEIsxhlmWl5/YESvpZ13" crossorigin="anonymous"></script>
            `
            var svg = `
               <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                   <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
                       <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                   </symbol>
                   <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                       <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                   </symbol>
                   <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                       <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                   </symbol>
               </svg>
           `
            
            var titulo = `<h1>Carga Para N&oacute;minas de Pago</h1>`
            var inputFile = `
                <form class="primary_form" method="POST" action="" enctype="multipart/form-data">
                    <label class="test" id="label__text" >
                        <div id="text__file">
                            Adjuntar Archivo
                        </div>
                        <input type="file" class="upload__file" name="file" id="file" onchange="mostrar();">
                    </label>
                    <div id="btn__submit">
                        <input type="submit" value="Cargar">
                    </div>
                </form>
                <script>
                    var mostrar = () =>{
                        let btn = document.getElementById("file");
                        let divText = document.getElementById("text__file");
                        console.log(btn.value.split('\\\\')[2]);
                        let textFile = btn.value.split('\\\\')[2];
                        divText.innerHTML=textFile;
                        console.log(divText);                                             
                    }
                </script>
            `;

            var firstStyle = `
                <style>
                    *{
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body{
                        display: grid;
                        grid-template-rows: 50% 10%;
                    }
                    .upload__file{
                        display:none;
                    }
                    .primary_form{
                        width: 530px;
                        display: grid;
                        grid-template-columns: repeat(3,2fr);
                        grid-template-areas: 
                            "a a b";
                    }
                    .container-form{
                        width: 100%;
                        height:100vh;
                    }
                    .titulo{
                        margin-left: 10%;
                        margin-right: 10%;
                        padding-top: 60px;
                        font-size: 18px;
                    }
                    .form-input{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 50%;
                    }
                    #text__file, #btn__submit{
                        border: 1px solid black;
                        height: 60px;
                        display: grid;
                        align-content: center;
                        cursor: pointer;
                        font-size: 20px;
                        font-weight: 300;
                    }
                    #label__text{
                        grid-area: a;
                        width: 100%;
                    }
                    #text__file{
                        margin-right: 10px;
                        padding-left: 15px;
                        text-align: start;
                    }
                    #btn__submit > input{
                        background: none;
                        color: #FFFF;
                        border: none;
                        height: inherit;
                    }
                    #btn__submit{
                        grid-area: b;
                        width: 90%;
                        color: #FFFF;
                        background-color: rgb(70, 70, 70);
                    }
                    #btn__submit:hover{
                        background-color: rgb(88, 88, 88);
                    }
                    .alert-form{
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        position: fixed;
                    }
                    .alert{
                        margin-top: 5px;
                        width: 350px;
                    }
                    #text__alert{
                        position: relative;
                        margin: auto;
                    }
                    .payroll__loaded{
                        display: grid;
                        justify-content: center;
                        justify-self: center;
                        width: 650px;
                    }
                    .payroll__loaded > .btn{
                        width: 40%;
                        justify-self: center;
                        margin-top: 6px;
                    }
                    .form_btn_payroll{
                        width: 100%;
                        display: grid;
                        justify-content: center;
                        grid-template-columns: 1fr;
                    }
                    .btn-primary{
                        width: 50%;
                        justify-self: center;
                    }
                </style>
            `
    
            var formUploadFile = `
                    <head>
                        ${firstStyle}
                        ${bootstrap}
                    </head>
                    <div class="container-form">
                        <div class="titulo">
                            ${titulo}
                        </div>
                        <div class="form-input">
                            ${inputFile}
                        </div>
                    </div>
                `;
            if(context.request.method === 'GET'){
                //TODO carga de archivo csv en netsuite.
                var firstHtml = `
                    ${formUploadFile}
                    ${scriptsBootstrap}
                `
                context.response.write(firstHtml);
                
                
            } else {
                //TODO Validación de extensión de archivo,  si es CSV se guardara en el file cabinet, si no, mostrará alerta indicando que se debe adjuntar un archivo de tipo CSV.
                try{
                    var fileObj = context.request.files.file;
                    if(fileObj){
                        var nameFile = fileObj.name;
                        var date = format.parse({
                            value: new Date(),
                            type: format.Type.DATE
                        });
                        
                        if(fileObj.fileType.toLowerCase() ==='csv'){
                            fileObj.folder = 3318;
                            var id = fileObj.save();

                            var datosNomina={
                                user : runtime.getCurrentUser().name,
                                name_file: nameFile,
                                date_time: date,
                                state: "Pendiente"
                            }

                            var idRecord = process.registerPayroll(datosNomina);
                            log.debug("id registro nuevo en trasacciones", idRecord);
                            log.debug("id archivo cargado", id);

                            var resultSearchNominas = nominas.searchPayroll();
                            var namePayroll = resultSearchNominas.map((item)=>{
                                
                                if(item.internal_id == idRecord){
                                    return item.name_file;  
                                }
                            });
                            namePayroll = namePayroll.toString().replace(/,/gi, '');
                            var payments = process.readPayrollFile(namePayroll);
                            log.debug("id registros de pagos", payments);
                            var textPayrollLoaded = `
                                <div class="payroll__loaded">
                                    <h3>N&oacute;mina cargada exitosamente, te notificaremos
                                    cuando esten registrados todos los pagos.</h3>
                                    <br>
                                    <form class="form_btn_payroll" method="POST" action="">
                                        <input type="text" name="payroll" value="nomina" hidden>
                                        <button type="submit" class="btn btn-primary btn-lg">Ver Estado de Nóminas</button>
                                    </form>
                                </div>
                            `;
                            var secondHtml = `
                                ${formUploadFile}
                                ${textPayrollLoaded}
                                ${scriptsBootstrap}
                            `
                            context.response.write(secondHtml);
                        }else {
                            var alerta = `
                                ${svg}
                                <div class="alert-form" id="alert-form">
                                    <div class="alert alert-danger d-flex align-items-center" role="alert">
                                        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                                        <div id="text__alert">
                                            El Archivo debe ser de extensión CSV.
                                        </div>
                                    </div>
                                </div>
                                <script>setTimeout();</script>
                            `
                            var html = `
                                <script>
                                    setTimeout(function(){
                                        var mensajeAlerta = document.getElementById("alert-form");
                                        mensajeAlerta.style.display="none";
                                    }, 5000)
                                </script>
                                ${alerta}
                                ${formUploadFile}
                                ${scriptsBootstrap}
                            `
                            context.response.write(html);
                        }
                        
                    
                    } else{
                        var titulo_lista = '<h1>N&oacute;minas de Pago</h1>'
                        var resultSearchNominas = nominas.searchPayroll();
                        log.debug("Cantidad de registros", resultSearchNominas.length);
                        var tablePayroll = resultSearchNominas.map((item)=>{
                            return `
                                <div>
                                    <input type="text" class="form-control" id="input__name__file" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" value="${item.name_file}" disabled>
                                    <input type="text" class="form-control" id="input__date__time" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" value="${item.date_time}" disabled>
                                    <input type="text" class="form-control" id="input__state" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" value="${item.state}" disabled>
                                </div>
                            `
                        });
                        tablePayroll = tablePayroll.toString().replace(/,/gi, '');
                        var secondStyle = `
                            <style>
                                *{
                                    margin: 0;
                                    padding: 0;
                                    box-sizing: border-box;
                                }
                                .container-form{
                                    width: 100%;
                                    height:100vh;
                                }
                                .titulo{
                                    margin-left: 10%;
                                    margin-right: 10%;
                                    padding-top: 50px;
                                    font-size: 18px;
                                }
                                .table{
                                    width: 100%;
                                    display: grid;
                                    justify-content: center;
                                    margin-top: 30px;
                                }
                                .table > div > input{
                                    border: 2px solid black;
                                    margin: 12px;
                                    height: 32px;
                                    font-size: 20px;
                                    text-align: center;
                                }
                                #input__name__file{
                                    width: 460px;
                                }
                                #input__date__time{
                                    width: 260px;
                                }
                                #input__state{
                                    width: 205px;
                                }
                                .table > div{
                                    width: 100%;
                                }
                            </style>
                        `
                        var html2 = `
                            <head>
                                ${secondStyle}
                            </head>
                            <div class="container-form">
                                <div class="titulo">
                                    ${titulo_lista}
                                </div>
                                <div class="table">
                                    ${tablePayroll}
                                </div>
                            </div>
                        `;
                        context.response.write(html2);
                    }
                    
                } catch(error){
                    log.error("error", error.message);
                }
            }
        }

        return {
            onRequest: onRequest
        };
});