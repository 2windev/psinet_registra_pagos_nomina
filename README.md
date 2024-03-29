# 2win_registra_pagos_nomina_psinet.

- **Bundle 456473 - versión 1.1**
- Lista de Componentes en bundle: [bundle.md](/bundle.md)

### Descripción.
Implementación para integración pago de nómias, las cuales, son descargadas desde un servidor a través de conexión SFTP de manera automática.

## Scheduled Script.
- Script [2win_ss_descarga_archivo_nomina.js](/2win_ss_descarga_archivo_nomina.js)
    > Librería necesaria para generar conexión a través de SFTP: [2WinConexionSftp.js](/libs/2WinConexionSftp.js)

    Script programado para realizar descarga de los archivos de nómina a través de sftp, dejando estos archivos en la carpeta **archivo_nomina** ubicada en SuiteBundles > Bundle 456473 > archivo_nomina.

    Los nombres que busca este script en el servidor sftp para descargar son los que tienen el siguiente formato;
    - **Operador_subsidiaria_YYYMMDD**

    |Operador  |Extensión|
    |----------|---------|
    |servipag  |TXT      |
    |cajavecina|TXT      |
    |pacpat    |CSV      |

- Script [2win_sd_openFilePayroll.js](/2win_sd_openFilePayroll.js)

    script programado, el cual, obtiene todas las nóminas que se encuentren en la carpeta **archivo_nomina**, si algúna nómina no se encuentra registrada en la tabla **Registro de Archivos de Pago Procesados** entonces se registrará y se obtendrá las deudas asociadas al cliente especificado en cada nómina, si existe deuda, entonces generará una transacción de tipo **Depósito de cliente** y una de tipo **Aplicación de depósito**

### Libs.
- Script [2WinArchivo-v2.0.js](/libs/2WinArchivo-v2.0.js) Módulo lib para el manejo de archivos.
- Script [2WinStaticParamsFacturacion.js](/libs/2WinStaticParamsFacturacion.js) Módulo lib para obtener parámetros desde tabla de "Parámetros de facturación".
- Script [2win_lib_procesar_datos_nomina.js](/libs/2win_lib_procesar_datos_nomina.js) Librería para realizar transacciones de tipo aplicación de depósito y despósito de cliente.
- Script [2win_lib_search_nominas_de_pago.js](/libs/2win_lib_search_nominas_de_pago.js) Librería para realizar busqueda de cliente, búsqueda de deuda, medios de pago, obtener archivos de nomina y validar si nómina ya fue procesada anteriormente. 
- Script [2WinConexionSftp.js](/libs/2WinConexionSftp.js) Librería para establecer conexión por sftp y descargar archivos con nombre especifico.

## Generar PassworGUID para conexión por SFTP.

Se debe crear una nueva passwordguid con Suitelet *2win_sFTP_Toolet* (https://7391587-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=89&deploy=1), el password generado debe quedar en el parámetro *sftp_origen_passwordgui_pago_nomina* ubicado en la tabla Parámetros de Facturación.

Para generar el passwordGUID es necesario completar los siguientes campos:

|campo                 |valor                                 |
|----------------------|--------------------------------------|
|RESTRICT TO SCRIPT IDS|customscript_2win_descarga_arch_nomina|
|RESTRICT TO DOMAINS   |172.174.249.155                       |
|PASSWORD              |pC11A5yf                              |


## Tabla Parámetro de facturación.
1. Parámetros de conexión a SFTP.

    |Nombre parámetro                   |Tipo parámetro|
    |-----------------------------------|--------------|
    |sftp_origen_username               |Text          |
    |sftp_origen_passwordgui_pago_nomina|Text          |
    |sftp_origen_url                    |Text          |
    |sftp_origen_directoryroot          |Text          |
    |sftp_origen_port                   |Number        |
    |sftp_origen_hostkey                |Text          |
    |sftp_origen_hostkeytype            |Text          |
    |sftp_nominas_pagos_ruta            |Text          |

2. Parámetros para la implementación.

    |Nombre parámetro                     |Tipo parámetro|
    |-------------------------------------|--------------|
    |pago_nominas_id_subsidiaria          |Text          |
    |pago_nominas_id_folder_archivo_nomina|Text          |
    |pago_nominas_responsables            |Text          |
    |id_empleado_envio_email              |Number        |
    
## Tabla Registro de Archivos de Pago Procesados.
- En está tabla personalizada se registra las nóminas procesadas.

    |Nombre Campo   |ID Campo      |
    |---------------|--------------|
    |Nombre         |name          |
    |Tipo de archivo|custrecord1470|
    |Fecha          |custrecord1471|