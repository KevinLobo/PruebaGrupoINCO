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

    $("#discountCell").keyup(function () {
        var html = (this).innerHTML;
        if (html == "") html = 0;
        discount = parseFloat(html);
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
            finalTotalCell.html(subtotal.toString());
        } else {
            finalTotalCell.html((subtotal - (subtotal * (discount / 100))).toString());
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
        extractInformation(parsedJson)
        return false;
    });

    function extractEnterpriseInformation(enterpriseInfo) {
        console.log(enterpriseInfo);
    }

    function extractCustomerInformation(customerInfo) {
        console.log(customerInfo);
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
        extractProductsInformation(json.data.products);
        extractInvoiceInformation(json.data.invoice);        
    }

    var doc = new jsPDF()

    doc.setFontSize(40)
    doc.text(35, 25, 'Paranyan loves jsPDF')




}); 


