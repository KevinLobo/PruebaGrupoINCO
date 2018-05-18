// Write your JavaScript code.

$().ready(function () {
    console.log("Hello World!");

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
            "emptyTable": "No products have been added.",
            "lengthMenu": "Show _MENU_ Registers",
            "paginate": {
                "previous": "Previous",
                "next": "Next"
            }
        }
    });



    var discount = 0;
    var tax = 0;

    $("#discountCell").keyup(function () {
        var html = (this).innerHTML;
        if (html === "" || html == "<br>") html = 0;
        discount = parseFloat(html);
        if (discount == NaN) discount = 0;
        calculateFinalTotal();
    });
    

    $("#salesInvoice tbody").on('click', '.add', function () {
        var data = tablaCompra.row($(this).parents('tr')).data();
        data[3]++;
        data[4] = data[3] * data[2];
        tablaCompra.row($(this).parents('tr')).data(data).draw();
        sumarColumnas();
        calculateFinalTotal();
    });

    $("#salesInvoice tbody").on('click', '.sub', function () {
        var data = tablaCompra.row($(this).parents('tr')).data();
        if (data[3] - 1 == 0) {
            tablaCompra.row($(this).parents('tr')).remove().draw();
        } else {
            data[3]--;
            data[4] = data[3] * data[2];
            tablaCompra.row($(this).parents('tr')).data(data).draw();
        }
        sumarColumnas();
        calculateFinalTotal();
    });


    $("#salesInvoice tbody").on('click', '.del', function () {
        tablaCompra.row($(this).parents('tr')).remove().draw();
        sumarColumnas();
        calculateFinalTotal();
    });

    function sumarColumnas() {
        var columnaCantidad = tablaCompra.column(3);
        var columnaTotal = tablaCompra.column(4);
        if (columnaCantidad.data().length == 0 && columnaTotal.data().length == 0) {
            $(columnaCantidad.footer()).html(0);
            $(columnaTotal.footer()).html(0);
        } else {
            $(columnaCantidad.footer()).html(
                columnaCantidad.data().reduce(function (a, b) {
                    return parseFloat(a) + parseFloat(b);
                })
            );
            $(columnaTotal.footer()).html(
                columnaTotal.data().reduce(function (a, b) {
                    return parseFloat(a) + parseFloat(b);
                })
            );
        }
    }

    function calculateFinalTotal() {
        var subtotal = parseFloat($("#subtotal").html())
        var finalTotalCell = $("#finalTotal");
        if (discount == 0) {
            finalTotalCell.html((subtotal + tax).toString());
        } else {
            finalTotalCell.html(((subtotal + tax) - ((subtotal + tax) * (discount / 100))).toString());
        }
    }


    /*
     * 
     * 
     * 
     *
     */
    $("#jsonForm").on('submit', function () {
        console.log("Form Submitted");
        var json = $("#jsonString").val();
        json = json.replace(/\t/g, "")
        json = json.replace(/\n/g, "")
        parsedJson = JSON.parse(json.replace(/\t/g, ""))
        console.log(parsedJson);
        tablaCompra.clear();
        extractInformation(parsedJson)
        return false;
    });

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

    function extractProductsInformation(productsInfo) {
        $.each(productsInfo, function (key, product) {
            product["Quantity"] = 1;
            product["Total"] = product["price"];
            var datos = $.map(product, function (el) { return el });
            tablaCompra.row.add(datos).draw();
            sumarColumnas();
            calculateFinalTotal();
        });
    }

    function extractInvoiceInformation(invoiceInfo) {
        console.log(invoiceInfo)
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
     * 
     * 
     * 
     * 
     * 
     */
    function extractInformation(json) {
        extractEnterpriseInformation(json.data.enterprise);
        extractCustomerInformation(json.data.customer);
        
        extractInvoiceInformation(json.data.invoice);
        extractProductsInformation(json.data.products);
    }

    var doc = new jsPDF()

    doc.setFontSize(40)
    doc.text(35, 25, 'Paranyan loves jsPDF')


    $('#guardarPDF').click(function () {
        tablaCompra.column(5).visible(false);
        
        

        var pdf = new jsPDF('p', 'pt', 'letter');
        var info = pdf.autoTableHtmlToJson(document.getElementById("salesInvoice"), false)
        // source can be HTML-formatted string, or a reference
        // to an actual DOM element from which the text will be scraped.
        source = $('#imprimir')[0];

        // we support special element handlers. Register them with jQuery-style 
        // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
        // There is no support for any other type of selectors 
        // (class, of compound) at this time.
        specialElementHandlers = {
            // element with id of "bypass" - jQuery style selector
            '#bypass': function (element, renderer) {
                // true = "handled elsewhere, bypass text extraction"
                return true
            }
        };
        margins = {
            top: 20,
            bottom: 60,
            left: 40,
            width: 522
        };
        // all coords and widths are in jsPDF instance's declared units
        // 'inches' in this case
        pdf.fromHTML(
            source, // HTML string or DOM elem ref.
            margins.left, // x coord
            margins.top, { // y coord
                'width': margins.width, // max width of content on PDF
                'elementHandlers': specialElementHandlers
            },

            function (dispose) {
                // dispose: object with X, Y of the last line add to the PDF 
                //          this allow the insertion of new lines after html
                pdf.autoTable(info.columns, info.rows, {
                    startY: 400,
                    tableWidth: 'auto', // 'auto', 'wrap' or a number, 
                    styles: {
                        overflow: 'linebreak',
                        halign: 'left', // left, center, right
                        valign: 'middle', // top, middle, bottom
                        columnWidth: 'auto'
                    }
                });
                pdf.save('table.pdf');
            }, margins);              

        tablaCompra.column(5).visible(true);
    });
}); 


