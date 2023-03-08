
// jika tombol tambah diklik
openFormAddData = () => {
  // jalankan read satuan dan kategori
  loadCategoryOptions();
  loadUnitOptions();
  console.log(`ok`);
};

closeFormAddData = () => {
  $("#form-add-data").removeClass("active");
  console.log(`ok`);
};

// function tampil messagedelete data
function deleteAction(id = false, data = false) {
  let message = `Apa anda yakin ingin menghapus ${data} ?`;
  // cek apakah id ada didalam parameter fungsi
  if (id) {
    let dialogBox = dialog.showMessageBoxSync({
      type: `question`,
      title: `delete records`,
      buttons: [`No`, `Yes`],
      defaultId: [0, 1],
      message: message,
    });
    // jika yg dipilih no maka batal hapus
    if (dialogBox === 0) {
      $("input.data-checkbox").prop("checked", false);
      $("tbody#data tr").removeClass("blocked");
    } else {
      // jika yes hapus data
      deleteRecord(id);
    }
    // jika tidak ada id yg dipilih maka buat function hapus all data
  } else {
    array_ids = [];
    $("input.data-checkbox:checked").each(function () {
      let ids = $(this).attr("id");
      array_ids.push(ids);
    });
    // jka checkbox tidak dicentang maka tampil pesan hapus seluruh data
    if (array_ids.length < 1) {
      let messageBox = dialog.showMessageBoxSync({
        type: `question`,
        title: `delete records`,
        buttons: [`No`, `Yes`],
        defaultId: [0, 1],
        message: `PERINGATAN!!! JIKA TIDAK ADA DATA YANG DIPILIH MAKA SELURUH DATA AKAN DISELEKSI, APAKAH ANDA YAKIN INGIN MENGHAPUS SELURUH DATA?`,
      });
      // jika user menekan no maka batal hapus, jika yes panggil function hapus semua data
      if (messageBox === 0) {
        console.log(`no`);
      } else {
        deleteAllRecords();
      }
    }
    // jika checkbox ada yg dicentang maka tampilkan pesan hapus data yg dicentang saja
    else {
      let messageBox = dialog.showMessageBoxSync({
        type: `question`,
        title: `delete records`,
        buttons: [`No`, `Yes`],
        defaultId: [0, 1],
        message: `Apa anda yakin ingin menghapus data-data yang dipilih?`,
      });
      // jika dipilih no maka batal hapus
      if (messageBox === 0) {
        console.log(`no`);
      }
      // jika yes hapus data yg dipilih panggil function deletemutilpeldata
      else {
        join_array_ids = array_ids.join(",");
        deleteMultipleRecords(join_array_ids);
      }
    }
  }
}

// FUNCTION SELECT ALL ITEM
selectAll = () => {
  $("input.data-checkbox").prop("checked", true);
  $("tbody#data tr").addClass("blocked");
};

// FUNCTION UNSELECT ALL ITEM
unselectAll = () => {
  $("input.data-checkbox").prop("checked", false);
  $("tbody#data tr").removeClass("blocked");
};

// paginantion first page
$("#first-page").click(function (e) {
  let searchVal = $("#search-data").val();
  e.preventDefault();
  let total_row_displayed = $("#row_per_page").val();
  $("#page_number").val(1);
  load_data(1, total_row_displayed, searchVal);
});

// pagination last page
$("#last-page").click(function (e) {
  e.preventDefault();
  let searchVal = $("#search-data").val();
  let total_page = $("#total_pages").val();
  $("#page_number").val(total_page);
  let total_row_displayed = $("#row_per_page").val();
  load_data(total_page, total_row_displayed, searchVal);
});

// pagination key up
$("#page_number").keyup(function () {
  let searchVal = $("#search-data").val();
  let page_number = $(this).val();
  let total_row_displayed = $("#row_per_page").val();
  load_data(page_number, total_row_displayed, searchVal);
});

// tombol page nextt
$("#next-page").click(function (e) {
  e.preventDefault();
  let searchVal = $('#search-data').val()
  let total_page = $("#total_pages").val();
  let input_val = $("#page_number").val();
  if (input_val == "") {
    input_val = 1;
  }
  let page_no = parseInt(input_val);
  let total_row_displayed = $("#row_per_page").val();
  if (page_no < total_page) {
    $("#page_number").val(page_no + 1);
    load_data(page_no + 1, total_row_displayed, searchVal);
  }
});

// tombal page previous
$("#prev-page").click(function (e) {
  e.preventDefault();
  let searchVal = $('#search-data').val()
  let input_val = $("#page_number").val();
  let page_no = parseInt(input_val);
  if (page_no > 1) {
    $("#page_number").val(page_no - 1);
    let total_row_displayed = $("#row_per_page").val();
    load_data(page_no - 1, total_row_displayed, searchVal);
  }
});

// paginanation row per page
$("#row_per_page").change(function () {
  let searchVal = $('#search-data').val()
  let total_row_displayed = $(this).val();
  let page_number = $("#page_number").val();
  let total_page = $("#total_pages").val();
  if (page_number > total_page) {
    let page_number = 1;
    $("#page_number").val(1);
  }
  load_data(page_number, total_row_displayed, searchVal);
});

// FUNCTION SEARCH, ambil input value
function search() {
  let searchVal = $("#search-data").val();
  let page_number = $("#page_number").val();
  let total_row_displayed = $("#row_per_page").val();
  load_data(page_number, total_row_displayed, searchVal);
}
// ketika tombol enter ditekan
$("#search-data").keydown(function (e) {
  if (e.keyCode === 13) {
    search();
  }
});
// ketika search kosong munculkan seluruh data
$("#search-data").keyup(function () {
  let val = $(this).val();
  let page = $("#page_number").val();
  let row = $("#row_per_page").val();
  if (val === "") {
    load_data(page, row);
  }
});

// FUNCTION EXPORT DATA
exportData = (ext) => {
  let array_ids = []
  $('input.data-checkbox:checked').each(function(){
    let ids = $(this).attr('id')
    array_ids.push(ids)
  })
  let filePath = dialog.showSaveDialogSync({
    title : `Export Data`,
    filters : [
      {name : ext, extensions : [ext]}
    ]
  })
  if(filePath != undefined){
    if(array_ids.length < 1) {
      executeExport(filePath, ext)
    } else {
      let join_ids = array_ids.join(',')
      executeExport(filePath, ext, join_ids)
    }
  } else {
    console.log(`Terjadi kesalahan export data.`)
  }
}

// FUNCTION EXECUTION EXPORT DATA
executeExport = (filePath, ext, joinIds = false) => {
  switch(ext){
    case 'csv' :
      exportCsv(filePath, ext, joinIds);
      break;
    case 'pdf' :
      exportPdf(filePath, ext, joinIds);
      break;
  }
}

// execution csv
exportCsv = (filePath, ext, joinIds = false) => {
  let doc_id = $('body').attr('id')
  switch(doc_id){
    case 'product-data' :
    exportCsvPrdData(filePath, ext, joinIds);
    break;
    case 'buyer-data' :
    exportCsvBuyerData(filePath, ext, joinIds);
    break;
    case 'sales' :
      exportCsvSalesData(filePath, ext, joinIds);
      break;
  }
}

// execution pdf
exportPdf = (filePath, ext, joinIds = false) => {
  let doc_id = $('body').attr('id')
  switch(doc_id){
    case 'product-data' :
    exportPdfPrdData(filePath, ext, joinIds);
    break;
    case 'sales-report' :
      exportPdfSalesReport(filePath, ext, joinIds);
      break;
    case 'buyer-data' :
      exportPdfBuyerData(filePath, ext, joinIds);
      break;
      case 'sales' :
        exportPdfSalesData(filePath, ext, joinIds);
        break;
  }
}

// FUNCTION PRINT
printData = () => {
  let array_ids = []
  $('input.data-checkbox:checked').each(function(){
    let ids = $(this).attr('id')
    array_ids.push(ids)
  })
  if(array_ids.length < 1) {
    executePrintData()
  } else {
    let joinArrayIds = array_ids.join(',')
    executePrintData(joinArrayIds)
  }
}

// excecute print
executePrintData = (join_ids = false) => {
  let doc_id = $('body').attr('id')
  switch(doc_id){
    case `product-data`:
      printPrdData(join_ids);
      break;
      case `sales`:
      printSalesData(join_ids);
      break;
      case `buyer-data`:
        printBuyerData(join_ids);
        break;
  }
  
}