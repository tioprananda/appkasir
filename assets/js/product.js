
// close produck
closeProduct = () => {
  ipcRenderer.send('close:product')
}

// buat iMask utk merender angka otomatis menjadi bentuk rupiah
let inputPrdPrice = IMask(document.getElementById("product_price"), {
  mask: "Rp num",
  blocks: {
    num: {
      mask: Number,
      thousandsSeparator: ".",
      scale: 3,
      radix: ",",
      mapToRadix: ["."],
      padFractionalZero: false,
      signed: false,
    },
  },
});
let inputPrdCost = IMask(document.getElementById("product_cost"), {
  mask: "Rp num",
  blocks: {
    num: {
      mask: Number,
      thousandsSeparator: ".",
      scale: 3,
      radix: ",",
      mapToRadix: ["."],
      padFractionalZero: false,
      signed: false,
    },
  },
});
let inputPrdQty = IMask(document.getElementById("product_initial_qty"), {
  mask: "num",
  blocks: {
    num: {
      mask: Number,
      thousandsSeparator: ".",
      padFractionalZero: false,
      signed: false,
    },
  },
});

// function totalprdpage berfungsi menjadi validasi row yang akan ditampilkan sesuai nomor page dari sql ke html
totalPrdPage = (total_row_displayed, searchVal) => {
  
    // get query seaarch
    let query
    if (searchVal != "") {
      query = `select count(*) as total_row from products where product_name like '%${searchVal}%' escape '!' or product_code like '%${searchVal}%' escape '!' or barcode like '%${searchVal}%' escape '!' or category like '%${searchVal}%' escape '!' or selling_price like '%${searchVal}%' escape '!' or cost_of_product like '%${searchVal}%' escape '!' 
      `;
    } else {
      // get query dari tota page
      query = `select count(*) as total_row from products`;
    }

  db.serialize(() => {
    db.each(query, (err, result) => {
      if (err) throw err;
      let total_page;
      if (result.total_row % total_row_displayed == 0) {
        total_page = parseInt(result.total_row) / parseInt(total_row_displayed);
      } else {
        total_page = parseInt(result.total_row / total_row_displayed) + 1;
      }
      $("#total_pages").val(total_page);
    });
  });
};

// READ ALL DATA, parameter berisi nomor page dan total row
function loadProduct(page_number, total_row_displayed, searchVal) {
  let row_number;
  // jika halaman kurang dari 2 maka row jadi 0 jika tidak halaman -1 dikali jumlah total row
  if (page_number < 2) {
    row_number = 0;
  } else {
    row_number = (page_number - 1) * total_row_displayed;
  }
  total_page(total_row_displayed, searchVal);

  // get query seaarch
  let query
 
  if (searchVal != "") {
    query = `select * from products where product_name like '%${searchVal}%' escape '!' or product_code like '%${searchVal}%' escape '!' or barcode like '%${searchVal}%' escape '!' or category like '%${searchVal}%' escape '!' or selling_price like '%${searchVal}%' escape '!' or cost_of_product like '%${searchVal}%' escape '!' or product_initial_qty like '%${searchVal}%' escape '!' order by id desc limit ${row_number}, ${total_row_displayed} 
    `;
  } else {
    // get query dari database product, desc limit membatasi jumlah tampilan data dari jumlah page
    query = `select * from products order by id desc limit ${row_number}, ${total_row_displayed}`;
  }

  db.serialize(() => {
    db.all(query, (err, rows) => {
      //jika error tampilkan error
      if (err) throw err;
      // buat var kosong utk disimpan isi dr database
      let tr = "";
      if (rows.length < 1) {
        tr += "";
      } else {
        // foreach rows ambil row dgn table tertentu dan masukan ke dalam var tr
        rows.forEach((row) => {
          // code mencari stock awal - qty penjualan sales pada cashir
          let queryCodePrdSales = `select * from sales where product_code = '${row.product_code}'`;
          tr += 
          
          `<tr data-id= ${row.id} class="text-center">
                            <td data-colname="Id">
                                ${row.id} <input type="checkbox" style="visibility : hidden;" id="${row.id}" class="data-checkbox">
                            </td>
                            <td>${row.product_name}</td>
                            <td>${row.product_code}</td>
                            <td>${row.barcode}</td>
                            <td>${row.category}</td>
                            <td>${row.unit}</td>
                            <td>${numberFormat(row.selling_price)}</td>
                            <td>${numberFormat(row.cost_of_product)}</td>
                            <td>${row.product_initial_qty}</td>
                            <td id='final-qty-${row.id}'>
                            ${
                              (() => {
                                let finalQty = row.product_initial_qty;
                                let infoMinus = ''
                               
                                db.all(queryCodePrdSales, (err, rows) => {
                                  if (err) throw err;
                                  let finalQtySales = rows.map(item => item.qty).reduce((acc, cur) => acc + cur, 0);
                                  finalQty -= finalQtySales;
                                    rows.filter((item) => {
                                      if(item.product_code === row.product_code){
                                        document.getElementById(`final-qty-${row.id}`).textContent = finalQty; 
                                      
                                      }
                                    })
                                    if(finalQty < 0){
                                      // alert minus
                                     infoMinus += `
                    
                                      <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                      Produk <strong>${row.product_name}</strong> dengan barcode <strong>${row.barcode}</strong> saat ini kurang dari 0.
                                      
                                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                      </div>
                                    
                                   </div>`

                                  //  angka merah
                                  let merah = `<span style="color:red;">${finalQty}</span>`
                                    
                                  $(`#final-qty-${row.id}`).html(merah)
                                  $("#warning-info").html(infoMinus);
                                    }
                                });
                                return finalQty;
                              })()
                            }
                            </td>
                            <td>
                                <button class="btn btn-sm btn-light btn-light-bordered" onclick="editRecord(${row.id})" id="edit-data"><i class="fa fa-edit"></i></button>
                                <button class="btn btn-sm btn-danger" onclick="deleteAction(${row.id}, '${row.product_name}')" id="delete-data"><i class="fa fa-trash"></i></button>
                            </td>
                          </tr>`;

                    let productCodeProduct = row.product_code
                    return productCodeProduct
        });
      }
      $("tbody#data").html(tr);
    });
  });
}

// reset form ketika selesai input
blankform = () => {
  $("#product_name").val(``);
  $("#product_barcode").val(``);
  $("#product_price").val(``);
  $("#product_cost").val(``);
  $("#product_initial_qty").val(``);
};

// CREATE DATA PRODUCT
insertProduct = () => {
  // buat let yang berisi value input dari id form
  let prd_name = $("#product_name").val();
  let prd_barcode = $("#product_barcode").val();
  let prd_category = $("#product_category").val();
  // utk price, qty dan cost karna menggunakan mask, valuenya harus di ubah ke unmask dulu agar terbaca ke database
  let prd_price = inputPrdPrice.unmaskedValue;
  let prd_cost = inputPrdCost.unmaskedValue;
  let prd_init_qty = inputPrdQty.unmaskedValue;
  let prd_last_qty = prd_init_qty;
  let prd_unit = $("#product_unit").val();

  // validasi ketika ada form yg belum diisi
  let required = $("[required]");
  let required_array = [];
  required.each(function () {
    if ($(this).val() != "") {
      required_array.push($(this).val());
    }
  });
  if (required_array.length < 5) {
    dialog.showMessageBox({
      title: "Alert",
      type: "info",
      message: "Nama Product, Barcode, Harga Jual, Harga Pokok dan Satuan harus diisi.",
    });
  } else if (parseInt(prd_price) < parseInt(prd_cost)) {
    dialog.showMessageBox({
      title: "Alert",
      type: "info",
      message: "Harga jual lebih kecil dari harga pokok.",
    });
  } else {
    db.serialize(() => {
      // validasi jika ada nama produk yg sama
      db.each(
        `select count(*) as row_number from products where product_name = '${prd_name}' or barcode = '${prd_barcode}'`,
        (err, res) => {
          if (err) throw err;
          if (res.row_number < 1) {
            // jalankan create query ke database
            db.run(
              `insert into products(product_name, barcode, category, selling_price, cost_of_product, product_initial_qty, product_last_qty, unit) values('${prd_name}','${prd_barcode}', '${prd_category}', '${prd_price}', '${prd_cost}', '${prd_init_qty}', '${prd_last_qty}', '${prd_unit}')`,
              (err) => {
                // generate code produk secara otomatis
                db.each(
                  `select id from products where product_name = '${prd_name}'`,
                  (err, row) => {
                    if (err) throw err;
                    db.run(
                      `update products set product_code = 'PR'||substr('000000'||${row.id},-6,6) where product_name = '${prd_name}'`,
                      (err) => {
                        if (err) throw err;
                        blankform();
                        $("product_name").focus();
                        let total_row_displayed = $('#row_per_page').val()
                        load_data(1, total_row_displayed);
                      }
                    );
                  }
                );
              }
            );
          } else {
            dialog.showMessageBox({
              title: "Alert",
              type: "info",
              message: "Nama produk/barcode sudah terdaftar.",
            });
          }
        }
      );
    });
  }
};

// READ DATA CATEGORY
loadCategoryOptions = () => {
  db.all(`select * from categories order by id desc`, (err, rows) => {
    if (err) throw err;
    let option = `<option value="">Kategori</option>`;
    rows.map((row) => {
      option += `<option value="${row.category}">${row.category}</option>`;
    });
    $("#product_category").html(option);
  });
};

// READ DATA SATUAN
loadUnitOptions = () => {
  db.all(`select * from units order by id desc`, (err, rows) => {
    if (err) throw err;
    let option = `<option value="">Satuan</option>`;
    rows.map((row) => {
      option += `<option value="${row.unit}">${row.unit}</option>`;
    });
    $("#product_unit").html(option);
  });
};

// FUNCTION REPLACE VALUE EDIT DATA PRODUCT
function selectUnitOption(unitOpt, unit) {
  let options = unitOpt.replace(
    `value="${unit}">`,
    `value="${unit}" selected>`
  );
  return options;
}

// FUNCTION REPLACE VALUE EDIT DATA PRODUCT
function selectCategoryOption(categoryOpt, category) {
  let options = categoryOpt.replace(
    `value="${category}">`,
    `value="${category}" selected>`
  );
  return options;
}

// FUNCTION QUERY EDIT DATA PRODUCT
editPrdData = (id) => {
  // tangkap queri database dari tabel units, categories dan products
  let sqlUnit = `select * from units`;
  let sqlCategory = `select * from categories`;
  let sql = `select * from products where id = ${id}`;

  // jalankan function db
  db.all(sqlUnit, (err, result) => {
    if (err) {
      throw err;
    } else {
      // edit satuan
      let unitOption;
      let unitOpts = `<option></option>`;
      result.forEach((item) => {
        unitOpts += `<option value="${item.unit}">${item.unit}</option>`;
      });
      unitOption = unitOpts;
      // edit kategori
      db.all(sqlCategory, (err, result) => {
        if (err) {
          throw err;
        } else {
          let categoryOption;
          let categoryOpts = `<option></option>`;
          result.forEach((item) => {
            categoryOpts += `<option value="${item.category}">${item.category}</option>`;
          });
          categoryOption = categoryOpts;

          // edit product form
          db.all(sql, (err, result) => {
            if (err) {
              throw err;
            } else {
              let row = result[0];
              let editForm;
              editForm = `
                            <div class="mb-3">
                                <input type="text" value="${
                                  row.product_name
                                }" id="editPrdName" placeholder="Nama Produk" class="form-control form-control-sm">
                                <input type="hidden" value="${
                                  row.product_name
                                }" id="prevPrdName">
                                <input type="hidden" value="${id}" id="rowId">      
                            </div>

                            <div class="mb-3">
                            <input type="text" value="${
                              row.barcode
                            }" id="editPrdBarcode" placeholder="Barcode" class="form-control form-control-sm">
                            <input type="hidden" value="${
                              row.barcode
                            }" id="prevPrdBarcode">
                           </div>

                           <div class="mb-3">
                           <select id="editPrdCategory" class="form-select form-select-sm">
                            ${selectCategoryOption(
                              categoryOption,
                              row.category
                            )}
                           </select>
                          </div>

                          <div class="mb-3">
                          <select id="editPrdUnit" class="form-select form-select-sm">
                           ${selectUnitOption(unitOption, row.unit)}
                          </select>
                         </div>

                         <div class="mb-3">
                            <input type="text" value="${
                              row.selling_price
                            }" placeholder="Harga Jual" id="editPrdPrice" class="form-control form-control-sm">
                        </div>

                            <div class="mb-3">
                            <input type="text" value="${
                              row.cost_of_product
                            }" placeholder="Harga Pokok" id="editPrdCost" class="form-control form-control-sm">
                        </div>

                            <div class="mb-3">
                            <input type="text" value="${
                              row.product_initial_qty
                            }" placeholder="Stock Awal" id="editPrdInitQty" class="form-control form-control-sm">
                        </div>

                            <div class="d-grid py-1">
                            <button class="btn btn-sm btn-warning btn-block" style="color:white" onclick="submitEditPrdData(${id})" id="btn-submit-edit">
                                <i class="fa fa-paper-plane"></i> Ubah Data
                            </button>
                        </div>
                            `;
              // buat halaman jendela window baru untuk rendering
              ipcRenderer.send(
                "load:edit",
                "product-data",
                editForm,
                300,
                450,
                id
              );
            }
          });
        }
      });
    }
  });
};

ipcRenderer.on("update:success", (e, msg) => {
  alertSuccess(msg);
  let page_number = $('#page_number').val()
  let total_row_displayed = $('#row_per_page').val()
  load_data(page_number, total_row_displayed);
});

// function export csv
exportCsvPrdData = (filePath, ext, joinIds = false) => {
  let sql
  let file_path = filePath.replace(/\\/g,'/')
  if(joinIds) {
    sql = `select * from products where id IN(${joinIds}) order by id desc`
  } else {
    sql = `select * from products order by id desc`
  }
  db.all(sql, (err, result) => {
    if (err) throw err;
    convertToCsv = async (arr) => {
      let array = [Object.keys(arr[0])].concat(arr);
  
      let lines = await Promise.all(array.map(async (item) => {
        let queryCodePrdSales = `select * from sales where product_code = '${item.product_code}'`;
        let finalQty = item.product_initial_qty;
        await new Promise((resolve, reject) => {
          db.all(queryCodePrdSales, (err, rows) => {
            if (err) reject(err);
            let finalQtySales = rows
              .map((item1) => item1.qty)
              .reduce((acc, cur) => acc + cur, 0);
            finalQty -= finalQtySales;
            item.product_last_qty = finalQty;
            resolve();
          });
        });
        let hasil = Object.values(item).toString();
        return hasil;
      }));
  
      let content = lines.join('\r\n');
      return content;
    };
  
    convertToCsv(result)
      .then((content) => {
        ipcRenderer.send('write:csv', file_path, content);
      })
      .catch((err) => {
        console.error(err);
      });
  });
  
}

// function export pdf
exportPdfPrdData = (filePath, ext, joinIds = false) => {
  let file_path = filePath.replace(/\\/g,'/')
  let sql 
  if(joinIds) {
    sql = `select * from products where id IN(${joinIds}) order by id desc`
    db.all(sql, (err, res) => {
      if (err) throw err
     
      let tbody = ''
      let thead = `
                  <tr>
                    <th>Id</th>
                    <th>Nama Produk</th>
                    <th>Kode Produk</th>
                    <th>Barcode</th>
                    <th>Kategori</th>
                    <th>Harga Jual</th>
                    <th>Harga Pokok</th>
                    <th>Satuan</th>
                    <th>Stok Awal</th>
                    <th>Stok Akhir</th>
                  </tr>
      `
      let queryCodePrdSales = `select * from sales where product_code = '${row.product_code}'`;
      res.forEach((row) => {
        (() => {
          let finalQty = row.product_initial_qty;
          db.all(queryCodePrdSales, (err, rows) => {
            if (err) throw err;
            let finalQtySales = rows.map(item => item.qty).reduce((acc, cur) => acc + cur, 0);
            finalQty -= finalQtySales;
              rows.filter((item) => {
                if(item.product_code === row.product_code){
                  return row.product_last_qty = finalQty
                }
              })
              return row.product_last_qty
          });
          return row.product_last_qty
        })()
        console.log(row.product_last_qty)
        tbody += `
                  <tr>
                    <td>${row.id}</td>
                    <td>${row.product_name}</td>
                    <td>${row.product_code}</td>
                    <td>${row.barcode}</td>
                    <td>${row.category}</td>
                    <td>${row.selling_price}</td>
                    <td>${row.cost_of_product}</td>
                    <td>${row.unit}</td>
                    <td>${row.product_initial_qty}</td>
                    <td>${row.product_last_qty}</td>
                  </tr>
        `
      })
      ipcRenderer.send('load:to-pdf', thead, tbody, file_path, 'product-data', 'Data Produk')
    })
  } else {
    sql = `select * from products order by id desc`
    db.all(sql, (err, res) => {
      if (err) throw err
      let tbody = ''
      let thead = `
                  <tr>
                    <th>Id</th>
                    <th>Nama Produk</th>
                    <th>Kode Produk</th>
                    <th>Barcode</th>
                    <th>Kategori</th>
                    <th>Harga Jual</th>
                    <th>Harga Pokok</th>
                    <th>Satuan</th>
                    <th>Stok Awal</th>
                    <th>Stok Akhir</th>
                  </tr>
      `
      res.forEach((row) => {
        let queryCodePrdSales = `select * from sales where product_code = '${row.product_code}'`;
        tbody += `
                  <tr>
                    <td>${row.id}</td>
                    <td>${row.product_name}</td>
                    <td>${row.product_code}</td>
                    <td>${row.barcode}</td>
                    <td>${row.category}</td>
                    <td>${row.selling_price}</td>
                    <td>${row.cost_of_product}</td>
                    <td>${row.unit}</td>
                    <td>${row.product_initial_qty}</td>
                    <td>${row.product_last_qty}</td>
                  </tr>
        `
        
      })
      ipcRenderer.send('load:to-pdf', thead, tbody, file_path, 'product-data', 'Data Produk')
    })
  }
}

// terima query print
printPrdData = (joinIds = false) => {
  let sql
  if(joinIds){
    sql = `select * from products where id IN(${joinIds}) order by id desc`
    db.all(sql, (err, res) => {
      if (err) throw err
      let tbody = ''
      let thead = `
                  <tr>
                    <th>Id</th>
                    <th>Nama Produk</th>
                    <th>Kode Produk</th>
                    <th>Barcode</th>
                    <th>Kategori</th>
                    <th>Harga Jual</th>
                    <th>Harga Pokok</th>
                    <th>Satuan</th>
                    <th>Stok Awal</th>
                    <th>Stok Akhir</th>
                  </tr>
      `
      res.forEach((row) => {
        tbody += `
                  <tr>
                    <td>${row.id}</td>
                    <td>${row.product_name}</td>
                    <td>${row.product_code}</td>
                    <td>${row.barcode}</td>
                    <td>${row.category}</td>
                    <td>${row.selling_price}</td>
                    <td>${row.cost_of_product}</td>
                    <td>${row.unit}</td>
                    <td>${row.product_initial_qty}</td>
                    <td>${row.product_last_qty}</td>
                  </tr>
        `
      })
      ipcRenderer.send('load:print-page', thead, tbody, 'product-data', 'Data Produk')
    })
  } else {
    sql = `select * from products order by id desc`
    db.all(sql, (err, res) => {
      if (err) throw err
      let tbody = ''
      let thead = `
                  <tr>
                    <th>Id</th>
                    <th>Nama Produk</th>
                    <th>Kode Produk</th>
                    <th>Barcode</th>
                    <th>Kategori</th>
                    <th>Harga Jual</th>
                    <th>Harga Pokok</th>
                    <th>Satuan</th>
                    <th>Stok Awal</th>
                    <th>Stok Akhir</th>
                  </tr>
      `
      res.forEach((row) => {
        tbody += `
                  <tr>
                    <td>${row.id}</td>
                    <td>${row.product_name}</td>
                    <td>${row.product_code}</td>
                    <td>${row.barcode}</td>
                    <td>${row.category}</td>
                    <td>${row.selling_price}</td>
                    <td>${row.cost_of_product}</td>
                    <td>${row.unit}</td>
                    <td>${row.product_initial_qty}</td>
                    <td>${row.product_last_qty}</td>
                  </tr>
        `
      })
      ipcRenderer.send('load:print-page', thead, tbody, 'product-data', 'Data Produk')
    })
  }
}

// tambah stock

// tampilkan data dropdown otomatis saat nama kode produk di ketik di kolom kode/barcode produk
let prdCodeArray = []
db.all(`select * from products`, (err, rows) => {
    if (err) throw err
    rows.map((row) => {
        prdCodeArray.push(row.product_code)
        prdCodeArray.push(row.barcode)
        prdCodeArray.push(row.product_name)
    })
})
$('#product_code').autocomplete({
    source : prdCodeArray
})

// function inser stock
// CRUD CREATE DAN UPDATE SALES
insertStock = () => {
  let product_code = $(`#product_code`).val().toUpperCase('')
  inputAddStock = $(`#product_initial_qty_stock`).val()
  let addStock = parseInt(inputAddStock)


  if(product_code != '' && product_code != null && inputAddStock != '' && inputAddStock != 0 && inputAddStock != null){
      // ketika user memgetik kode/bacode namun tidak ditemukan tamplikan pesan 
      db.all(`select * from products where product_code = '${product_code}' or barcode = '${product_code}' or product_name = '${product_code}'`, (err, row) => {
          if(err) throw err
    
          if(row.length < 1 ) {
              let alert = dialog.showMessageBoxSync({
                  title : `alert`,
                  type : `info`,
                  message : `Produk dengan barcode/code produk ${product_code} tidak ditemukan.`
              })
              if(alert == 0) {
                  $('#product_code').val('')
              }
          } 
          else {
              db.all(`select * from products where product_code = '${product_code}' or barcode = '${product_code}' or product_name = '${product_code}'`, (err, rows) => {
                  if (err) throw err
                 rows.forEach((row) => {
                   let qty = parseInt(row.product_initial_qty)
                   let new_qty = qty+addStock
                   let messageBox = dialog.showMessageBoxSync({
                          type: `question`,
                          title: `Tambah data`,
                          buttons: [`Yes`, `No`],
                          defaultId: [0, 1],
                          message: `Apakah anda yakin ingin menambahkan stock pada produk ${product_code}?`,
                        });
                         if(messageBox === 0){
                          console.log(new_qty)
                          db.run(`update products set product_initial_qty = '${new_qty}' where product_code = '${product_code}' or barcode = '${product_code}' or product_name = '${product_code}'`, err => {
                              if (err) throw err
                              dialog.showMessageBoxSync({
                                title : `alert`,
                                type : `info`,
                                message : `stock pada ${product_code} berhasil ditambahkan.`
                            })
                              $('#product_code').val('')
                              $('#product_initial_qty_stock').val('')
                              load_data(1, total_row_displayed);
                          })
                        } else {
                          console.log(`no`)
                        }
                 })
              })
          }
      })
  } else if (inputAddStock == '' || inputAddStock == null || inputAddStock == 0){
    dialog.showMessageBoxSync({
      title : `alert`,
      type : `info`,
      message : `Masukan jumlah quantity.`
  })
  } else {
      dialog.showMessageBoxSync({
          title : `alert`,
          type : `info`,
          message : `Masukan kode/barcode produk.`
      })
  }
}

// FUNCTION SUBMIT ADD STOCK KETIKA DIENTER
$(`#product_code, #product_initial_qty_stock`).keydown(function(e){
  if(e.keyCode == 13){
          insertStock()
  }
})