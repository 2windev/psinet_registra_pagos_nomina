# 2win_registra_pagos_nomina_psinet - Bundle 456473

1. Crear nueva password con Suitelet *2win_sFTP_Toolet* para parámetro *sftp_origen_passwordguid* en tabla Parámetros de Facturación que incluya el siguiente script:

    customscript_2win_sd_openfilepayroll

    (2win_sFTP_Toolet https://7391587-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=89&deploy=1)

2. Configurar parámetros de conexión a SFTP.

    sftp_origen_username
    sftp_origen_passwordguid 
    sftp_origen_url
    sftp_origen_directoryroot
    sftp_origen_port
    sftp_origen_hostkey
    sftp_origen_hostkeytype
