// close halaman data penjualan
closeSalesData = () => {
    ipcRenderer.send('close:sales-data')
}
// CRUD NEXT PREV CONTENT HALAMAN
totalSalesPage = (totalRowDisplayed, searchVal) => {
let query 
if(searchVal != ''){
    query = `select count(*) as total_row from sales where invoice_number like '%${searchVal}%' escape '!'`
} else {
    query = `select count(*) as total_row from sales`
}
db.each(query, (err, row) => {
    if (err) throw err
    let totalPage
    if(row.total_row%totalRowDisplayed == 0){
        totalPage = parseInt(row.total_row)/parseInt(totalRowDisplayed)
    } else {
        totalPage = parseInt(row.total_row/totalRowDisplayed)+1
    }
    $('#total_pages').val(totalPage)
})
}

// CRUD GET DATA PENJUALAN
loadSales = (pageNumber, totalRowDisplayed, searchVal) => {
    let rowNumber
    if(pageNumber < 2){
        rowNumber = 0
    } else {
        rowNumber = (pageNumber-1)*totalRowDisplayed
    }
    totalSalesPage(totalRowDisplayed, searchVal)
    let query
    if(searchVal != ''){
        query = `select * from sales where invoice_number like '%${searchVal}%' escape '!' or product_name like '%${searchVal}%' escape '!' or product_code like '%${searchVal}%' escape '!' or input_date like '%${searchVal}%' escape '!' order by id desc limit ${rowNumber}, ${totalRowDisplayed}`
    } else {
        query = `select * from sales order by id desc limit ${rowNumber}, ${totalRowDisplayed}`
    }
    db.all(query, (err, rows) => {
        if(err)throw err
        let tr = ``
        if(rows.length < 1) {
            tr += ``
        } else {
            rows.forEach(row => {
                let discountPercent = row.discount_percent
                let discountMoney = row.discount_money
                let discountInfo
                if(discountMoney == '' && discountPercent == ''){
                    discountInfo = ""
                } else if (discountPercent != '' && discountMoney == ""){
                    discountInfo = `${discountPercent}%`
                } else if (discountPercent != '' && discountMoney != ''){
                    discountInfo= `${discountPercent}%+${numberFormat(discountMoney)}`
                } else if (discountPercent == '' && discountPercent != ''){
                    discountInfo = `${numberFormat(discountMoney)}`
                }
                tr += `
                    <tr data-id="${row.id}" class="text-center">
                        <td>${row.id}</td>
                        <td>${row.input_date}</td>
                        <td>${row.invoice_number }</td>
                        <td>${row.product_name}</td>
                        <td>${row.product_code}</td>
                        <td>${row.barcode}</td>
                        <td>${numberFormat(row.price)}</td>
                        <td>${numberFormat(row.qty)}</td>
                        <td>${row.unit}</td>
                        <td>${discountInfo}</td>
                        <td>${numberFormat(row.total)}</td>
                    </tr>
                `
            })
        }
        $('tbody#data').html(tr)
    })
}

// function export csv
exportCsvSalesData = (filePath, ext, joinIds = false) => {
    let sql
    let file_path = filePath.replace(/\\/g,'/')
    if(joinIds) {
      sql = `select * from sales where id IN(${joinIds}) order by id desc`
    } else {
      sql = `select * from sales order by id desc`
    }
    db.all(sql, (err, result) => {
      if(err)throw err
      convertToCsv = (arr) => {
        let array = [Object.keys(arr[0])].concat(arr)
        return array.map((item) => {
          
       item.sales_admin = ''

          return Object.values(item).toString()
        }).join('\r\n')
      }
      let content = convertToCsv(result)
     
      ipcRenderer.send('write:csv', file_path, content)
    })
  }

  // function export pdf
exportPdfSalesData = (filePath, ext, joinIds = false) => {
    let file_path = filePath.replace(/\\/g,'/')
    let sql 
    if(joinIds) {
      sql = `select * from sales where id IN(${joinIds}) order by id desc`
      db.all(sql, (err, res) => {
        if (err) throw err
  
        let tbody = ''
        let thead = `
                    <tr>
                      <th>Id</th>
                      <th>Tanggal</th>
                      <th>Nomor Penjualan</th>
                      <th>Nama Produk</th>
                      <th>Barcode</th>
                      <th>Harga</th>
                      <th>Qty</th>
                      <th>Satuan</th>
                      <th>Potongan</th>
                      <th>Total</th>
                    </tr>
        `
        res.forEach((row) => {
          let queryCodeSalesData = `select * from sales where product_code = '${row.product_code}'`;
          let discountPercent = row.discount_percent
                let discountMoney = row.discount_money
                let discountInfo
                if(discountMoney == '' && discountPercent == ''){
                    discountInfo = ""
                } else if (discountPercent != '' && discountMoney == ""){
                    discountInfo = `${discountPercent}%`
                } else if (discountPercent != '' && discountMoney != ''){
                    discountInfo= `${discountPercent}%+${numberFormat(discountMoney)}`
                } else if (discountPercent == '' && discountPercent != ''){
                    discountInfo = `${numberFormat(discountMoney)}`
                }
          tbody += `
                    <tr>
                      <td>${row.id}</td>
                      <td>${row.input_date}</td>
                      <td>${row.invoice_number}</td>
                      <td>${row.product_name}</td>
                      <td>${row.barcode}</td>
                      <td>${numberFormat(row.price)}</td>
                      <td>${numberFormat(row.qty)}</td>
                      <td>${row.unit}</td>
                      <td>${discountInfo}</td>
                      <td>${row.total}</td>
                    </tr>
          `
        })
        ipcRenderer.send('load:to-pdf', thead, tbody, file_path, 'sales', 'Data Sales')
      })
    } else {
      sql = `select * from sales order by id desc`
      db.all(sql, (err, res) => {
        if (err) throw err
        let tbody = ''
        let thead = `
                    <tr>
                    <th>Id</th>
                    <th>Tanggal</th>
                    <th>Nomor Penjualan</th>
                    <th>Nama Produk</th>
                    <th>Barcode</th>
                    <th>Harga</th>
                    <th>Qty</th>
                    <th>Satuan</th>
                    <th>Potongan</th>
                    <th>Total</th>
                </tr>
        `
        res.forEach((row) => {
          let queryCodeSalesData = `select * from sales where product_code = '${row.product_code}'`;
              let discountPercent = row.discount_percent
                let discountMoney = row.discount_money
                let discountInfo
                if(discountMoney == '' && discountPercent == ''){
                    discountInfo = ""
                } else if (discountPercent != '' && discountMoney == ""){
                    discountInfo = `${discountPercent}%`
                } else if (discountPercent != '' && discountMoney != ''){
                    discountInfo= `${discountPercent}%+${numberFormat(discountMoney)}`
                } else if (discountPercent == '' && discountPercent != ''){
                    discountInfo = `${numberFormat(discountMoney)}`
                }
                
          tbody += `
                        <tr>
                        <td>${row.id}</td>
                        <td>${row.input_date}</td>
                        <td>${row.invoice_number}</td>
                        <td>${row.product_name}</td>
                        <td>${row.barcode}</td>
                        <td>${numberFormat(row.price)}</td>
                        <td>${numberFormat(row.qty)}</td>
                        <td>${row.unit}</td>
                        <td>${discountInfo}</td>
                        <td>${row.total}</td>
                        </tr>
          `
          
        })
        ipcRenderer.send('load:to-pdf', thead, tbody, file_path, 'sales', 'Data Sales')
      })
    }
  }
  
  // terima query print
  printSalesData = (joinIds = false) => {
    let sql
    if(joinIds){
      sql = `select * from sales where id IN(${joinIds}) order by id desc`
      db.all(sql, (err, res) => {
        if (err) throw err
        let tbody = ''
        let thead = `
                    <tr>
                      <th>Id</th>
                      <th>Tanggal</th>
                      <th>Nomor Penjualan</th>
                      <th>Nama Produk</th>
                      <th>Kode Produk</th>
                      <th>Barcode</th>
                      <th>Harga</th>
                      <th>Qty</th>
                      <th>Satuan</th>
                      <th>Potongan</th>
                      <th>Total</th>
                    </tr>
        `
        res.forEach((row) => {
                      let discountPercent = row.discount_percent
                      let discountMoney = row.discount_money
                      let discountInfo
                      if(discountMoney == '' && discountPercent == ''){
                          discountInfo = ""
                      } else if (discountPercent != '' && discountMoney == ""){
                          discountInfo = `${discountPercent}%`
                      } else if (discountPercent != '' && discountMoney != ''){
                          discountInfo= `${discountPercent}%+${numberFormat(discountMoney)}`
                      } else if (discountPercent == '' && discountPercent != ''){
                          discountInfo = `${numberFormat(discountMoney)}`
                      }
                      
                tbody += `
                              <tr>
                              <td>${row.id}</td>
                              <td>${row.input_date}</td>
                              <td>${row.invoice_number}</td>
                              <td>${row.product_name}</td>
                              <td>${row.product_code}</td>
                              <td>${row.barcode}</td>
                              <td>${numberFormat(row.price)}</td>
                              <td>${numberFormat(row.qty)}</td>
                              <td>${row.unit}</td>
                              <td>${discountInfo}</td>
                              <td>${row.total}</td>
                              </tr>
              
                      `
        })
        ipcRenderer.send('load:print-page', thead, tbody, 'sales', 'Data Sales')
      })
    } else {
      sql = `select * from sales order by id desc`
      db.all(sql, (err, res) => {
        if (err) throw err
        let tbody = ''
        let thead = `
                      <tr>
                      <th>Id</th>
                      <th>Tanggal</th>
                      <th>Nomor Penjualan</th>
                      <th>Nama Produk</th>
                      <th>Kode Produk</th>
                      <th>Barcode</th>
                      <th>Harga</th>
                      <th>Qty</th>
                      <th>Satuan</th>
                      <th>Potongan</th>
                      <th>Total</th>
                    </tr>
        `
        res.forEach((row) => {
          let discountPercent = row.discount_percent
                let discountMoney = row.discount_money
                let discountInfo
                if(discountMoney == '' && discountPercent == ''){
                    discountInfo = ""
                } else if (discountPercent != '' && discountMoney == ""){
                    discountInfo = `${discountPercent}%`
                } else if (discountPercent != '' && discountMoney != ''){
                    discountInfo= `${discountPercent}%+${numberFormat(discountMoney)}`
                } else if (discountPercent == '' && discountPercent != ''){
                    discountInfo = `${numberFormat(discountMoney)}`
                }
                
          tbody += `
                        <tr>
                        <td>${row.id}</td>
                        <td>${row.input_date}</td>
                        <td>${row.invoice_number}</td>
                        <td>${row.product_name}</td>
                        <td>${row.product_code}</td>
                        <td>${row.barcode}</td>
                        <td>${numberFormat(row.price)}</td>
                        <td>${numberFormat(row.qty)}</td>
                        <td>${row.unit}</td>
                        <td>${discountInfo}</td>
                        <td>${row.total}</td>
                        </tr>
          `
        })
        ipcRenderer.send('load:print-page', thead, tbody, 'sales', 'Data Sales')
      })
    }
  }