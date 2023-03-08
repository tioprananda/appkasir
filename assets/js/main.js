// panggil atribut id di body product
let doc_id = $('body').attr('id')

// perulangan no halaman
total_page = (total_row_displayed, searchVal = "") => {
    switch(doc_id){
        case 'product-data':
            totalPrdPage(total_row_displayed, searchVal)
            break
        case 'buyer-data':
            totalBuyerPage(total_row_displayed, searchVal)
            break
    }
}

// switch id = product data dan jalankan function loadProduct
load_data = (page_number, total_row_displayed, searchVal = "") => {
    switch(doc_id){
        case 'product-data' :
            loadProduct(page_number, total_row_displayed, searchVal);  
            break;
        case 'sales' :
            loadSales(page_number, total_row_displayed, searchVal);
            break;
        case 'buyer-data' :
             loadBuyer(page_number, total_row_displayed, searchVal);
             break;
    
    }
}


// tangkap id page number dan total row display utk paginatioan
let page_number = $('#page_number').val()
let total_row_displayed = $('#row_per_page').val()
let searchVal = $('#search-data').val()
load_data(page_number, total_row_displayed, searchVal)



// QUERY DELETE DATA PRODUK
deleteRecord = (id) => {
    let doc_id = $('body').attr('id')
    let table
    switch (doc_id) {
        // ketika ada id yg namanya product_data
        case 'product-data':
            table = 'products'
            break;
               // ketika ada id yg namanya buyer_data
        case 'buyer-data':
            table = 'buyers'
            break;
    }
    // hapus product_data dalam table sql
    let sql = `delete from ${table} where id = ${id}`
    db.run(sql, err => {
        if (err) {
            console.log(err)
        } else {
            // tangkap id page number dan total row display utk paginatioan
            let page_number = $('#page_number').val()
            let total_row_displayed = $('#row_per_page').val()
            let searchVal = $('#search-data').val()
            load_data(page_number, total_row_displayed, searchVal)
        }
    })
}

// QURY DELETE ALL DATA PRODUCT
deleteAllRecords = () => {
    let doc_id = $('body').attr('id')
    let table
    switch (doc_id){
        case 'product-data':
            table = 'products';
            break;
             // ketika ada id yg namanya buyer_data
        case 'buyer-data':
            table = 'buyers'
            break;
    }
    
    let sql = `delete from ${table}`
    db.run(sql, err => {
        if (err){
            console.log(err)
        }else {
            // tangkap id page number dan total row display utk paginatioan
            let page_number = $('#page_number').val()
            let total_row_displayed = $('#row_per_page').val()
            let searchVal = $('#search-data').val()
            load_data(page_number, total_row_displayed, searchVal)
        }
    })
}

// QUERE DELETE MULTIPLE DATA PRODUCT
deleteMultipleRecords = (ids) => {
    let doc_id = $('body').attr('id')
    let table
    switch (doc_id) {
        case 'product-data':
            table = 'products';
            break;
             // ketika ada id yg namanya buyer_data
        case 'buyer-data':
            table = 'buyers'
            break;
    }
    let sql = `delete from ${table} where id IN(${ids})`
    db.run(sql, err => {
        if (err) {
            console.log(err)
        } else {
            // tangkap id page number dan total row display utk paginatioan
            let page_number = $('#page_number').val()
            let total_row_displayed = $('#row_per_page').val()
            let searchVal = $('#search-data').val()
            load_data(page_number, total_row_displayed, searchVal)
        }
    })
}

// FUNCTION KLIK ROW OTOMATIS MENCENTANG CHECKBOX
$('tbody#data').on('click', 'tr', function() {
    let data_id = $(this).attr('data-id')
    let checkBox = $('input[type="checkbox"]#'+data_id)
    checkBox.prop('checked', !checkBox.prop('checked'))
    $(this).toggleClass('blocked')
})

// FUNCTION EDIT DATA
editRecord = (id) => {
    let doc_id = $('body').attr('id')
    switch (doc_id) {
        case 'product-data':
            editPrdData(id)
            break;
        case 'buyer-data':
            editBuyerData(id)
            break;
    }
}

// FUNCTION ALERT SUCCESS
alertSuccess = (msg) => {
    let div = `<div class="alert alert-success">${msg}</div>`
    $(`#alert`).html(div)
    // setelah alert muncul, buat settimeout untuk close alert dalam waktu 4 dtk
    clearAlert = () => {
        $('#alert').html('')
    }
   setTimeout(clearAlert, 4000)
}

// fungsi format angka
numberFormat = (number) => {
    let numFormat = new Intl.NumberFormat(`de-DE`).format(number)
    return numFormat
}