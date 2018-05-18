$().ready(function () {

    //Inicializamos DataTables en la tabla principal con las opciones necesarias
    var tablaCompra = $('#salesInvoice').DataTable({
        "bDestroy": true,
        "bAutoWidth": false,
        "paging": false,
        "searching": false,
        "ordering": false,
        "retrieve": true,
        "info": false,
        "columnDefs": [
            { className: "dt-center", "targets": "_all" },
            {
                "targets": -1,
                "data": null,
                "defaultContent": `<div class="btn-group">
                                        <a class="btn btn-primary add"><i class="fa fa-plus-circle"></i></a>
                                        <a class="btn btn-warning sub"><i class="fa fa-minus-circle"></i></a>
                                        <a class="btn btn-danger del"><i class="fa fa-times-circle"></i></a>
                                    </div>`}
        ],
        "language": {
            "emptyTable": "No se han agregado productos.",
            "lengthMenu": "Mostrar _MENU_ Registros",
            "paginate": {
                "previous": "Anterior",
                "next": "Siguiente"
            }
        }
    });


    //Variables globales para el descuento, impuesto y id de la factura
    var discount = 0;
    var tax = 0;
    var idFactura = 0;


    /*
    * Esta función hace el binding del evento "keyup", es decir, después de teclear una tecla
    * Para calcular en caliente el total del costo de acuerdo al descuento que esté ingresando el usuario.
    */
    $("#discountCell").keyup(function () {
        var html = (this).innerHTML;
        if (html === "" || html == "<br>") html = 0;
        discount = parseFloat(html);
        if (discount == NaN) discount = 0;
        calculateFinalTotal();
    });
    

    /*
    * Esta función hace el binding del evento "click" al botón de agregar en la tabla
    * Para calcular en caliente la cantidad de productos, el costo total de cada uno y el total de la factura.
    */
    $("#salesInvoice tbody").on('click', '.add', function () {
        var data = tablaCompra.row($(this).parents('tr')).data(); //Encuentra en cuál fila está el botón utilizado
        data[3]++; //Aumenta la cantidad del producto
        data[4] = data[3] * data[2]; //Calcula el costo total del producto
        tablaCompra.row($(this).parents('tr')).data(data).draw(); //Se redibuja la tabla para mostrar los cambios
        //Se calculan los totales de la factura de acuerdo con los cambios realizados
        sumarColumnas();
        calculateFinalTotal();
    });


    /*
    * Esta función hace el binding del evento "click" al botón de disminuir en la tabla
    * Para calcular en caliente la cantidad de productos, el costo total de cada uno y el total de la factura.
    */
    $("#salesInvoice tbody").on('click', '.sub', function () {
        var data = tablaCompra.row($(this).parents('tr')).data(); //Encuentra en cuál fila está el botón utilizado
        if (data[3] - 1 == 0) {
            tablaCompra.row($(this).parents('tr')).remove().draw(); //Si tenía solo una unidad del producto, y quito unidades, se debe borrar.
        } else {
            data[3]--; //Disminuye la cantidad del producto
            data[4] = data[3] * data[2]; //Calcula el costo total del producto
            tablaCompra.row($(this).parents('tr')).data(data).draw(); //Se redibuja la tabla para mostrar los cambios
        }
        //Se calculan los totales de la factura de acuerdo con los cambios realizados
        sumarColumnas();
        calculateFinalTotal();
    });


    /*
    * Esta función hace el binding del evento "click" al botón de borrar en la tabla
    * Para calcular en caliente la cantidad de productos, el costo total de cada uno y el total de la factura.
    */
    $("#salesInvoice tbody").on('click', '.del', function () {
        tablaCompra.row($(this).parents('tr')).remove().draw(); //Encuentra en cuál fila está el botón y borra ese producto
        //Se calculan los totales de la factura de acuerdo con los cambios realizados
        sumarColumnas();
        calculateFinalTotal();
    });


    /*
    * Función sumarColumnas. No recibe parámetros.
    * Descripción: Calcula la cantidad total de los productos y el total final de los productos, es decir el subtotal.
    */
    function sumarColumnas() {
        var columnaCantidad = tablaCompra.column(3); //Se obtiene la columna de Cantidad
        var columnaTotal = tablaCompra.column(4); //Se obtiene la columna de Precio Total
        if (columnaCantidad.data().length == 0 && columnaTotal.data().length == 0) { //Si no hay datos ponemos todo en 0.
            $(columnaCantidad.footer()).html(0);
            $(columnaTotal.footer()).html(0);
        } else {
            $(columnaCantidad.footer()).html(
                columnaCantidad.data().reduce(function (a, b) { //Calculamos el total de cantidad de productos.
                    return parseFloat(a) + parseFloat(b);
                })
            );
            $(columnaTotal.footer()).html(
                columnaTotal.data().reduce(function (a, b) { //Calculamos el total del precio de todos los productos.
                    return parseFloat(a) + parseFloat(b);
                })
            );
        }
    }

    /*
    * Función calculateFinalTotal. No recibe parámetros.
    * Descripción: Calcula el final total de la factura tomando en cuenta el descuento y los impuestos
    */
    function calculateFinalTotal() {
        var subtotal = parseFloat($("#subtotal").html()) //Obtenemos el subtotal como número
        var finalTotalCell = $("#finalTotal"); //Obtenemos en qué parte del DOM va a ir el total final
        if (discount == 0) {
            finalTotalCell.html((subtotal + tax).toString()); //Si no hay descuento, simplemente es el subtotal - impuesto
        } else {
            finalTotalCell.html(((subtotal + tax) - ((subtotal + tax) * (discount / 100))).toString()); //Si hay descuento, se lo aplicamos.
        }
    }

    // Esta función verifica si el string es una URL válida
    function ValidURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?'+ // port
          '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
          '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return pattern.test(str);
    }


    /*
     * Esta función se ejecuta cuando el formulario del Json se va a enviar.
     * Verifica la validez del Json y llama a la función para extraer los datos de este.
     */
    $("#jsonForm").on('submit', function () {
        $("#error").html(""); //Elimina el mensaje de error, por si hubiera alguno

        var json = $("#jsonString").val(); //Obtiene el texto del campo de texto.

        if (json === "") { //Si esta vacío mostrarmos el error y no hacemos nada
            $("#error").html("Debe ingresar un Json");
            return false;
        }

        if (ValidURL(json)) { //Determina si lo ingresado fue una URL
            obtenerDesdeURL(json);
            return false;
        } else { //Si no, verificamos que el texto ingresado sea un JSON
            try { //Verificamos si al parsear el json hay error. Si lo hay mostramos el error y no hacemos nada.
                json = json.replace(/\t/g, "") //Quitamos tabs y saltos de línea del JSON.
                json = json.replace(/\n/g, "")
                var parsedJson = JSON.parse(json.replace(/\t/g, "")) //Parseamos el JSON.
                if (parsedJson.description !== "success") { //Algo pasó al obtener la info
                    $("#error").html("Hubo un error al obtener la información.");
                    return false;
                }
                tablaCompra.clear(); //Limpiamos la tabla, por si ya se había cargado otra factura.
                extractInformation(parsedJson) //Mandamos a extraer los datos del JSON.
                return false
            } catch (err) {
                $("#error").html("El formato del JSON es inválido");
                return false;
            }
        }       
        
        return false;
    });


    /*
    * Función para obtener el JSON desde una URL.
    * Recibe la URL como parámetro
    */
    function obtenerDesdeURL(url) {
        var jqxhr = $.getJSON(url, function() {
        })
            .done(function (data) { //Si todo sale bien, y es un JSON, ejecutamos este bloque
                if (typeof data.data === 'undefined') { //En este caso, si el JSON no trae el key de data, no nos sirve
                    $("#error").html("El JSON no contiene toda la información requerida.");
                    return;
                }
                if (data.description !== "success") { //Algo pasó al obtener la info
                    $("#error").html("Hubo un error al obtener la información.");
                    return;
                }
                tablaCompra.clear(); //Limpiamos la tabla, por si ya se había cargado otra factura.
                extractInformation(data) //Mandamos a extraer los datos del JSON.
            })
          .fail(function() {
            $("#error").html("Hubo un error al obtener el JSON");
          })
    }

    //Las siguientes funciones simplemente extraen la información del JSON y muestran los datos en la aplicación
    function extractEnterpriseInformation(enterpriseInfo) {
        $("#nombreEmpresa").html("<b>Nombre: </b>"+enterpriseInfo.name);
        $("#telefonoEmpresa").html("<b>Teléfono: </b>" +enterpriseInfo.phone);
        $("#emailEmpresa").html("<b>Correo: </b>" +enterpriseInfo.email);
        $("#direccionEmpresa").html("<b>Dirección: </b>" +enterpriseInfo.address);
    }

    function extractCustomerInformation(customerInfo) {
        $("#nombreCliente").html("<b>Nombre: </b>" + customerInfo.name);
        $("#telefonoCliente").html("<b>Teléfono: </b>" + customerInfo.phone);
        $("#contactoCliente").html("<b>Contacto: </b>" + customerInfo.contact);
    }


    //Esta función le agrega la cantidad y el total a cada producto y lo agrega a la tabla de Datatables
    function extractProductsInformation(productsInfo) {
        $.each(productsInfo, function (key, product) {
            product["Quantity"] = 1;
            product["Total"] = product["price"];
            var datos = $.map(product, function (el) { return el }); //Genera los datos en el formato adecuado para Datatables
            tablaCompra.row.add(datos).draw();
            sumarColumnas();
            calculateFinalTotal();
        });
    }

    function extractInvoiceInformation(invoiceInfo) {
        console.log(invoiceInfo)
        idFactura = invoiceInfo.id;
        $("#idFactura").html("<b>ID: </b>" + invoiceInfo.id);
        $("#fechaFactura").html("<b>Fecha: </b>" + invoiceInfo.date);
        var libreImpuestos = "";
        if (invoiceInfo.taxFree) {
            libreImpuestos = "Sí";
        } else {
            libreImpuestos = "No";
        }
        $("#libreImpuestos").html("<b>Libre de Impuestos: </b>" + libreImpuestos);
        tax = invoiceInfo.tax;
        $("#taxCell").html(tax);
    }


    /*
     * Función para extraer la información del JSON
     * Recibe como parámetro el json del cual se va a extraer la información 
     */
    function extractInformation(json) {
        extractEnterpriseInformation(json.data.enterprise);
        extractCustomerInformation(json.data.customer);        
        extractInvoiceInformation(json.data.invoice);
        extractProductsInformation(json.data.products);
    }

    $('#guardarPDF').click(function () {
        tablaCompra.column(5).visible(false); //Hacemos invisible la columna de opciones para que no salga en el PDF       
        

        var pdf = new jsPDF('p', 'pt', 'letter');
        //Generamos un json a partir de la tabla, false para ignorar la columna invisible
        var info = pdf.autoTableHtmlToJson(document.getElementById("salesInvoice"), false)  

        //Esta es la fuente, o sea el HTML, que vamos a agregar al PDF
        source = $('#imprimir')[0];

        //Cualquier elemento con id bypass no va a aparecer en el PDF
        specialElementHandlers = {
            // element with id of "bypass" - jQuery style selector
            '#bypass': function (element, renderer) {
                // true = "handled elsewhere, bypass text extraction"
                return true
            }
        };

        //Márgenes de las posiciones para agregar el HTML
        margins = {
            top: 20,
            bottom: 60,
            left: 40,
            width: 500
        };

        //Todas las coordenas y ancho están en el formato de jsPDF, en este caso pixeles
        pdf.fromHTML(
            source, // Fuente del HTML
            margins.left, // Coordenada X
            margins.top, { // Coordenada Y
                'width': margins.width, // Ancho máximo del contenido
                'elementHandlers': specialElementHandlers
            },

            //Esta función se ejecuta después de agregar el HTML, es para poder agregar más cosas al PDF
            function (dispose) {
                // dispose: Objeto con posiciones X y Y de la última línea para saber donde agregar los otros elementos

                pdf.autoTable(info.columns, info.rows, {
                    startY: 375,
                    tableWidth: 'auto', // 'auto', 'wrap' or a number, 
                    styles: {
                        overflow: 'linebreak',
                        halign: 'left', // left, center, right
                        valign: 'middle', // top, middle, bottom
                        columnWidth: 'auto'
                    },
                    columnStyles: {
                        3: {columnWidth: 60, halign: 'center'}
                    }
                });
                pdf.save('factura#'+idFactura+'.pdf'); //Y guardamos el PDF
            }, margins);              

        tablaCompra.column(5).visible(true); //Volvemos a mostrar la columna opciones
    });
}); 


