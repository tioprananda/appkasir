
// FUNCTION TOMBOL UBAH
submitEditPrdData = (rowId) => {
  // tangkap elemen id di html
  let prdName = $("#edit-form").find("#editPrdName").val()
  let prevPrdName = $("#edit-form").find("#prevPrdName").val()
  let prdBarcode = $("#edit-form").find("#editPrdBarcode").val()
  let prevPrdBarcode = $("#edit-form").find("#prevPrdBarcode").val()
  let prdPrice = $("#edit-form").find("#editPrdPrice").val()

  // jika prdname atau prdprice kosong
  if (prdName === "" || prdPrice === "") {
    // munculkan pesan
    dialog.showMessageBoxSync({
      title: `alert`,
      type: `info`,
      message: `Nama produk dan harga harus diisi.`,
    });
  } else {
    // jika sudah diisi, cek apakah nama produk sama dgn nama produk sebelum diubah
    if (prdName === prevPrdName) {
      // jika sama, cek apakah barcode kosong atau nama barkode sama dengan nama barkod sebelum diubah
      if (prdBarcode === "" || prdBarcode === prevPrdBarcode) {
        // jalankan function edit data
        executeEditPrdData(rowId);
      } else {
        // jika barcode sudah clear jalankan function query edit data
        let sql = `select count(*) as count from products where barcode = '${prdBarcode}'`;
        db.all(sql, (err, row) => {
          if (err) throw err
          let rowNumber = row[0].count;
          if (rowNumber < 1) {
            executeEditPrdData(rowId)
          } else {
            // munculkan pesan
            dialog.showMessageBoxSync({
              title: `alert`,
              type: `info`,
              message:
                "Barcode '" + prdBarcode + "'sudah terdaftar didalam database.",
            });
          }
        });
      }
    } else {
      // cek apakah nama produk sudah ada didalam database
      let sql = `select count(*) as count from products where product_name = '${prdName}'`;
      db.all(sql, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          let rowNumber = result[0].count;
          if (rowNumber < 1) {
            if (prdBarcode === "" || prdBarcode === prevPrdBarcode) {
              executeEditPrdData(rowId)
            } else {
              let sql = `select count(*) as count from products where barcode = '${prdBarcode}'`;
              db.all(sql, (err, row) => {
                if (err) throw err;
                let rowNumber = row[0].count;
                if (rowNumber < 1) {
                  executeEditPrdData(rowId);
                } else {
                  // munculkan pesan
                  dialog.showMessageBoxSync({
                    title: `alert`,
                    type: `info`,
                    message:
                      "Barcode '" +
                      prdBarcode +
                      "'sudah terdaftar didalam database.",
                  });
                }
              });
            }
          } else {
            // munculkan pesan
            dialog.showMessageBoxSync({
              title: `alert`,
              type: `info`,
              message:
                "Produk '" + prdName + "'sudah terdaftar didalam database.",
            });
          }
        }
      });
    }
  }
};

// validasi kolom harga jual, harga pokok dan satuan
executeEditPrdData = (rowId) => {
    let prdName = $('#edit-form').find('#editPrdName').val()
    let prdBarcode = $('#edit-form').find('#editPrdBarcode').val()
    let prdCategory = $('#edit-form').find('#editPrdCategory').val()
    let prdPrice = $('#edit-form').find('#editPrdPrice').val()
    let prdCost = $('#edit-form').find('#editPrdCost').val()
    let prdInitQty = $('#edit-form').find('#editPrdInitQty').val()
    let prdUnit = $('#edit-form').find('#editPrdUnit').val()

    if(prdPrice === "") {
          // munculkan pesan
          dialog.showMessageBoxSync({
            title: `alert`,
            type: `info`,
            message: `Harga jual harus diisi.`
          });
    } else if (prdCost === '') {
          // munculkan pesan
          dialog.showMessageBoxSync({
            title: `alert`,
            type: `info`,
            message:`Harga pokok harus diisi`
          });
    } else if (parseInt(prdPrice) < parseInt(prdCost)) {
          // munculkan pesan
          dialog.showMessageBoxSync({
            title: `alert`,
            type: `info`,
            message:`Harga jual berada dibawah harga pokok`
          });
    } else {
        // jalakan query update data
        let query = `update products set product_name = '${prdName}', barcode = '${prdBarcode}', category = '${prdCategory}', unit = '${prdUnit}', selling_price = ${prdPrice}, cost_of_product = ${prdCost}, product_initial_qty = '${prdInitQty}' where id = ${rowId} 
        `
          // kirim render query update data ke index.js
          db.serialize(() => {
            db.run(query, err => {
              if(err) throw err
              ipcRenderer.send('update:success', doc_id)
            })
          })
       
    }
};
