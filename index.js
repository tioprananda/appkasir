// panggil electron
const electron = require("electron");

// import database
const db = require("./config/database/db_config");

// panggil libary
const { app, BrowserWindow, ipcMain, screen, webContents, dialog } = electron;

// panggi remote show box
const remote = require("@electron/remote/main");

// import file system csv dan pdf
const fs = require("fs");

// import path csv dan pdf
const path = require("path");

// import url csv dan pdf
const url = require("url");

// import md5
const md5 = require(`md5`);
const { ipcRenderer } = require("electron");
const { config } = require("process");

remote.initialize();

// buat halaman window dengan ukuran 550px
let mainWindow;

// product
let productWindow;
let editDataModal;
let toPdf;
let printPage;

// kasir
let cashierWindow;
let salesModal;
let salesNum;
let printSalesPage;
let buyerModal;

// data penjualan
let salesWindow;

// laporan penjualan
let salesReportWindow;

// grafik
let chartWindow

// data buyer/customer
let buyerWindow

// setting
let modalGeneralSetting
let userSettingModal

// login
let loginModal
let login = false
let firstName
let userId
let position
let accessLevel

// profile
let profilSettingModal

// logo
let storeObject = {}

// database otomatis
let configTableModal

ipcMain.on('success:login', (e, msgUserId, msgFirstName, msgPosition, msgAccesslevel) => {
  login = true
  firstName = msgFirstName
  position = msgPosition
  userId = msgUserId
  accessLevel = msgAccesslevel
  mainWindow.webContents.send('unlock:app', storeObject, msgUserId, firstName, position, accessLevel)
  loginModal.hide()
})

// logout
ipcMain.on('submit:logout', () => {
  loginModal.show()
})

// jendela login
modalTableConfig = () => {
  configTableModal = new BrowserWindow ({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation : false
    },
    width : 300,
    height : 150,
    parent : mainWindow,
    modal : true,
    autoHideMenuBar : true,
    frame : false,
    minimizable : false,
    maximizable :false,
    resizable : false
  })
  configTableModal.loadFile('modals/config-table.html')
  configTableModal.on('close', (e) => {
    e.preventDefault()
  })
  configTableModal.on('minimize', (e) => {
    e.preventDefault()
  })
  configTableModal.on('maximize', (e) => {
    e.preventDefault()
  })
}

// jendela login
modalLogin = () => {
  loginModal = new BrowserWindow ({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation : false
    },
    width : 400,
    height : 350,
    parent : mainWindow,
    modal : true,
    autoHideMenuBar : true,
    frame : false,
    minimizable : false,
    maximizable :false,
    resizable : false
  })

  // execute logo
  db.all(`select * from profil where id = 1 order by id asc`, (err, row) => {
    if(err) throw err
    storeObject.name = row[0].store_name;
    storeObject.logo = row[0].logo;
  })

  // render jendela login
  loginModal.loadFile('modals/login.html')
  remote.enable(loginModal.webContents)
  loginModal.webContents.on('did-finish-load', () => {
    loginModal.focus()
  })
}


// function setting
modalGeneralSetting = () => {
  generalSettingModal = new BrowserWindow ({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation : false
    },
    autoHideMenuBar : true,
    title : 'Pengaturan Umum',
    parent : mainWindow,
    modal : true,
    width : 500,
    height : 540,
    resizable : false,
    minimizable : false
  })
  generalSettingModal.loadFile(`modals/general-setting.html`)
  let taxPercentage
  db.all(`select * from tax where tax_name = 'pajak' and id = 1`, (err, row) => {
    if(err) throw err
    if(row.length < 1) {
      taxPercentage = ''
    } else {
      taxPercentage = row[0].percentage
    }
  })
  remote.enable(generalSettingModal.webContents)
  generalSettingModal.webContents.on('dom-ready', () => {
    generalSettingModal.webContents.send('load:config', taxPercentage)
  })
}

// function user setting
modalUserSetting = () => {
  userSettingModal = new BrowserWindow ({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation : false
    },
    autoHideMenuBar : true,
    title : 'Pengaturan Admin/User',
    parent : mainWindow,
    modal : true,
    width : 500,
    height : 540,
    resizable : false,
    minimizable : false
  })
  userSettingModal.loadFile(`modals/user-setting.html`)
  remote.enable(userSettingModal.webContents)
  userSettingModal.webContents.on('dom-ready', () => {
    userSettingModal.webContents.send('load:data', userId, accessLevel)
  })
}

// function profile setting
modalProfilSetting = () => {
  profilSettingModal = new BrowserWindow ({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation : false
    },
    autoHideMenuBar : true,
    title : 'Profile Toko',
    parent : mainWindow,
    modal : true,
    width : 500,
    height : 675,
    resizable : false,
    minimizable : false
  })
  profilSettingModal.loadFile(`modals/profil-setting.html`)
  remote.enable(profilSettingModal.webContents)
}

ipcMain.on('sales-number', (e, msgSalesNumber) => {
  salesNum = msgSalesNumber
})

mainWin = () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    height: 550,
    resizable: false,
    title: "kasir.app.v1.0",
    autoHideMenuBar: true,
    frame : false
  });
  mainWindow.loadFile("index.html");
    // execute logo
    db.all(`select name from sqlite_master where type = 'table' and name not like 'sqlite_%'`, (err, rows) => {
      if(err) throw err
      if(rows.length < 1) {
        mainWindow.webContents.on('did-finish-load', () => {
          mainWindow.webContents.send('load:overlay', storeObject)
        })
        modalTableConfig()
        db.run(`CREATE TABLE profil(id integer primary key, store_name varchar(150), store_tax_id varchar(150), store_address varchar(150), store_moto varchar(150), store_website varchar(150), phone_number varchar(150), email varchar(100), fax varchar(50), bank_account_one varchar(100), bank_name_one varchar(100), bank_account_two varchar(100), bank_name_two varchar(100), logo varchar(150))`, err => {
          if (err) throw err
          db.run(`CREATE TABLE users(id integer primary key autoincrement, username varchar(100) not null, password varchar(100) not null, access_level varchar(100) not null, first_name varchar(100) not null, last_name varchar(100) not null, position varchar(100), phone_number varchar(12), employee_number varchar(50), status varchar(20))`, err => {
            if(err) throw err
              db.run(`CREATE TABLE buyers (id integer primary key autoincrement, name varchar(150), address text, website varchar(100),telp_one varchar(20), telp_two varchar(20), email varchar(150))`, err => {
                if (err) throw err
                db.run(`CREATE TABLE products(id integer primary key autoincrement, product_name varchar(200) not null unique, product_code varchar(200), barcode varchar(200), category varchar(100), selling_price real, cost_of_product real, product_initial_qty integer, product_last_qty integer, unit varchar(20), check(cost_of_product <= selling_price))`, err => {
                  if(err) throw err
                  db.run(`CREATE TABLE discount_final(id integer primary key autoincrement, input_date text, invoice_number varchar(100) not null, discount_percent real, discount_money real, total_discount_final real)`, err => {
                    if (err) throw err
                    db.run(`CREATE TABLE sales(id integer primary key autoincrement, input_date text, invoice_number varchar(100), buyer varchar(100), buyer_id integer, payment varchar(6), description text, po_number varchar(100), due_date text, term varchar(100), sales_admin varchar(100), product_name varchar(200) not null, barcode varchar(200) not null, product_code varchar(200) not null, cost_of_product real, price real, qty integer, unit varchar(20), discount_percent real, discount_money real, total real)`, err => {
                      if(err) throw err 
                      db.run(`CREATE TABLE sales_evidence_info (id integer primary key autoincrement, invoice_number varchar(100), print_status varchar(15))`, err => {
                        if(err) throw err
                        db.run(`CREATE TABLE sales_tax(id integer primary key autoincrement, input_date text, invoice_number varchar(100), total_tax real)`, err => {
                          if(err) throw err
                          db.run(`CREATE TABLE tax(id integer primary key autoincrement, tax_name varchar(100), percentage real)`, err => {
                            if(err) throw err
                            db.run(`CREATE TABLE categories(id integer primary key autoincrement, category varchar(100))`, err => {
                              if(err) throw err
                              db.run(`CREATE TABLE units(id integer primary key autoincrement, unit varchar(20))`, err => {
                                if(err) throw err
                                db.run(`insert into profil(store_name, logo) values('My Store', 'shop.png')`, err => {
                                  if(err) throw err
                                  db.run(`insert into users(username, password, access_level, first_name, last_name) values('admin', 'admin', 'main_user', 'admin', 'satu')`, err => {
                                    if(err) throw err
                                    db.run(`insert into tax(tax_name, percentage) values ('pajak', '10')`, err => {
                                      if (err) throw err
                                      db.run(`insert into units(unit) values('Pack'),('Pcs'),('Kg'),('Lusin')`, err => {
                                        if(err) throw err
                                        db.run(`insert into categories(category) values('Electronic'), ('Gadget'), ('Peralatan'), ('Lainnya')`, err => {
                                          if(err) throw err
                                          finilizeTableConfig = () => {
                                            configTableModal.hide()
                                            modalLogin()
                                          }
                                          setTimeout(() => {
                                            finilizeTableConfig()
                                          }, 2000);
                                        })
                                      })
                                    })
                                  })
                                })
                              })
                            }) 
                          })
                        })
                      })
                    })
                  })
                })
              })
          })
        })
      } else {
        db.all(`select * from profil where id = 1 order by id asc`, (err, row) => {
          if(err) throw err
          storeObject.name = row[0].store_name;
          storeObject.logo = row[0].logo;
        })

        if(!login){
          mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('load:overlay', storeObject)
          })
          modalLogin()
        }
      }
    })
    

  // terima render window close dan minimize
  ipcMain.on('window:minimize', () => {
    mainWindow.minimize()
  })
  ipcMain.on('window:close', () => {
    app.quit()
  })

  // // tes apakah database berhasil dijalankan
  // db.serialize(() => {
  //   console.log(`ok`);
  // });
};

// jalankan aplikasi
app.on("ready", () => {
  mainWin();
});

// terima render login
ipcMain.on('close:app', () => {
  app.quit()
})

// panggil product-window
ipcMain.on("load:product-window", () => {
  productWin();
});

// buat halaman product
productWin = () => {
  // responsive layar halaman product
  const { height, width } = screen.getPrimaryDisplay().workAreaSize;

  productWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
    width: width,
    height: height,
    title: `kasir.app.v1.0 | Data Produk`,
  });

  // enable module remote dialog box
  remote.enable(productWindow.webContents);

  //   ketika halaman product dibuka, halaman home ditutup
  productWindow.loadFile("windows/product.html");
  productWindow.webContents.on("did-finish-load", () => {
    mainWindow.hide();
  });

  // ketika halaman product ditutup, halaman home dibuka
  productWindow.on("close", () => {
    mainWindow.show();
  });

};

// close product
ipcMain.on('close:product', () => {
  productWindow.close();
})

// terima data dari ipcrender edit data
editData = (docId, modalForm, modalWidth, modalHeight, rowId) => {
  let parentWin;
  switch (docId) {
    case `product-data`:
      parentWin = productWindow;
      break;
  }
  // buat jendela window editdata modal
  editDataModal = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: modalWidth,
    height: modalHeight,
    resizable: false,
    maximizable: false,
    minimizable: false,
    parent: parentWin,
    modal: true,
    title: `User Option`,
    autoHideMenuBar: true,
  });
  remote.enable(editDataModal.webContents);
  editDataModal.loadFile("modals/edit-data.html");
  editDataModal.webContents.on("did-finish-load", () => {
    editDataModal.webContents.send(`res:form`, docId, modalForm, rowId);
  });
  editDataModal.on("close", () => {
    editDataModal = null;
  });
};
ipcMain.on(
  "load:edit",
  (event, msgDocId, msgForm, msgWidth, msgHeight, msgRowId) => {
    editData(msgDocId, msgForm, msgWidth, msgHeight, msgRowId);
  }
);

// terima query render update data
ipcMain.on("update:success", (e, msgDocId) => {
  switch (msgDocId) {
    case "product-data":
      productWindow.webContents.send(
        "update:success",
        "data produk berhasil di-update."
      );
      break;
      case "buyer-data":
      buyerWindow.webContents.send(
        "update:success",
        "data customer berhasil di-update."
      );
      break;
  }
  editDataModal.close();
});

// tampilkan pesan export csv berhasil
writeCsv = (path, content) => {
  fs.writeFile(path, content, (err) => {
    if (err) throw err;
    dialog.showMessageBoxSync({
      title: `alert`,
      type: `info`,
      message: `File csv berhasil di export.`,
    });
  });
};

// terima query render export csv
ipcMain.on("write:csv", (e, msgPath, msgContent) => {
  writeCsv(msgPath, msgContent);
});

// buat halaman window baru untuk menampilkan data print pdf
loadtoPdf = (param1, param2, file_path, totalSales = false, docId = false, title) => {
  toPdf = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
  })

  let totalObject
  if(totalSales) {
    totalObject = totalSales
  } else {
    totalObject = ''
  }

  let d = new Date();
  let day = d.getDate().toString().padStart(2, 0);
  let month = d.getMonth().toString().padStart(2, 0);
  let year = d.getFullYear();
  let today = `${day}/${month}/${year}`;

  titleObject = {
    title,
    date: today,
  };
  db.all(`select * from profil order by id asc limit 1`, (err, row) => {
    if (err) throw err;
    if (row.length < 1) {
      titleObject.storeName = `My Store`,
        titleObject.storeAddress = `Address`,
        titleObject.storeLogo = `shop.png`;
    } else {
      titleObject.storeName = row[0].store_name;
      titleObject.storeAddress = row[0].store_address;
      if (row[0].logo == null || row[0].logo == "") {
        titleObject.storeLogo = "shop.png";
      } else {
        titleObject.storeLogo = row[0].logo;
      }
    }
  });

  switch (docId) {
    case `sales-report`:
      toPdf.loadFile("export-pdf/sales-report-pdf.html");
      break;
    default:
      toPdf.loadFile(`export-pdf/toPdf.html`);
  }

  toPdf.webContents.on(`dom-ready`, () => {
    toPdf.webContents.send(
      `load:table-to-pdf`,
      param1,
      param2,
      totalObject,
      titleObject,
      file_path
    );
  });
};

// terima query export pdf
ipcMain.on(
  "load:to-pdf",
  (e, msgThead, msgTbody, msgFilePath, msgTotalSales, msgDocId, msgTitle) => {
    loadtoPdf(msgThead, msgTbody, msgFilePath, msgTotalSales, msgDocId, msgTitle);
  }
);

// terima query export selected pdf
ipcMain.on(`create:pdf`, (e, file_path) => {
  toPdf.webContents
    .printToPDF({
      marginsType: 0,
      printBackground: true,
      printSelectionOnly: false,
      landscape: true,
    })
    .then((data) => {
      fs.writeFile(file_path, data, (err) => {
        if (err) throw err;
        toPdf.close();
        dialog.showMessageBoxSync({
          title: `alert`,
          type: `info`,
          message: `Berhasil export data ke PDF.`,
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

// pesan print
loadPrintPage = (param1, param2, docId = false, title) => {
  printPage = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // show : false
  });

  let d = new Date();
  let day = d.getDate().toString().padStart(2, 0);
  let month = d.getMonth().toString().padStart(2, 0);
  let year = d.getFullYear();
  let today = `${day}/${month}/${year}`;

  titleObject = {
    title,
    date: today,
  };
  db.all(`select * from profil order by id asc limit 1`, (err, row) => {
    if (err) throw err;
    if (row.length < 1) {
      titleObject.storeName = `My Store`,
        titleObject.storeAddress = `Address`,
        titleObject.storeLogo = `shop.png`;
    } else {
      titleObject.storeName = row[0].store_name;
      titleObject.storeAddress = row[0].store_address;
      if (row[0].logo == null || row[0].logo == "") {
        titleObject.storeLogo = "shop.png";
      } else {
        titleObject.storeLogo = row[0].logo;
      }
    }
  });

  switch (docId) {
    case `sales-report`:
      printPage.loadFile("export-pdf/sales-record-pdf.html");
      break;
    default:
      printPage.loadFile(`print.html`);
  }

  printPage.webContents.on("dom-ready", () => {
    printPage.webContents.send(
      "load:table-to-print",
      param1,
      param2,
      titleObject
    );
  });
};

// terima query print
ipcMain.on("load:print-page", (e, msgThead, msgTbody, msgDocId, msgTitle) => {
  loadPrintPage(msgThead, msgTbody, msgDocId, msgTitle);
});
ipcMain.on("print:page", () => {
  printPage.webContents.print(
    {
      printBackground: true,
    },
    () => {
      printPage.close();
    }
  );
  printPage.on(`close`, () => {
    printPage = null;
  });
});

// HALAMAN MENU KASIR

// jendela menu kasir
cashierWin = () => {
  cashierWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
    width: 1200,
    height: 720,
    title: "kasir.app.v1.0 | Kasir",
  });
  cashierWindow.loadFile("windows/cashier.html");
  // cashierWindow.setFullScreen(true)
  remote.enable(cashierWindow.webContents);

  cashierWindow.webContents.on("did-finish-load", () => {
    mainWindow.hide();
  });

  cashierWindow.on("close", () => {
    mainWindow.show();
  });
};

// terima render halaman kasir window
ipcMain.on("load:cashier-window", () => {
  cashierWin();
});

// terima render close cashier
ipcMain.on("close:cashier", () => {
  cashierWindow.close();
});

// function modalsales
modalSales = (salesNumber, title, totalSales, buyerInfo) => {
  let width
  let height
  let frameBoolVal
  let titleBar
  let content
  let buyerAddress = buyerInfo
  let tr = ''
  switch(title) {
      case 'discount-final' :
          width = 620
          height = 350
          frameBoolVal = true
          titleBar = 'Potongan Final'
          db.all(`select sum(total) as total from sales where invoice_number = '${salesNumber}'`, (err, row) => {
              if(err) throw err
              if(row.length < 1) {
                  console.log(`no sales with number '${salesNumber}'`)
              } else {
                  let total_sales = row[0].total
                  db.all(`select * from discount_final where invoice_number = '${salesNumber}'`, (err, row) => {
                      if(err) throw err
                      if(row.length < 1) {
                          content = `<div class="mb-2">
                                          <small>* Silahkan beri diskon sesuai dengan jenis yang diinginkan (% atau tunai (Rp) atau kedua-duanya)</small><br>
                                          <small>* Masukkan persentase potongan tanpa diikuti tanda % dan jumlah potongan tanpa diikuti tanda Rp</small><br>
                                      </div>
                                      <div class="mb-2">
                                          <div class="mb-2">
                                              <label>Potongan (%)</label>
                                              <input type="hidden" id="total-sales" value="${total_sales}">
                                              <input type="hidden" class="invoice-number" id="invoice-number" value="${salesNumber}">
                                              <input type="hidden" id="total-discount-final">
                                              <input type="text" class="form-control form-control-sm" onkeyup="newDiscountFinal()" id="discount-final-percent">
                                          </div>
                                          <div class="mb-2">
                                          <label>Potongan Tunai (Rp)</label>
                                          <input type="text" class="form-control form-control-sm" onkeyup="newDiscountFinal()" id="discount-final-money">
                                          </div>
                                      </div>`
                      } else {
                          content = `<div class="mb-2">
                                          <small>* Silahkan beri diskon sesuai dengan jenis yang diinginkan (% atau tunai (Rp) atau kedua-duanya)</small><br>
                                          <small>* Masukkan persentase potongan tanpa diikuti tanda % dan jumlah potongan tanpa diikuti tanda Rp</small><br>
                                      </div>
                                      <div class="mb-2">
                                          <div class="mb-2">
                                              <label>Potongan (%)</label>
                                              <input type="hidden" id="total-sales" value="${total_sales}">
                                              <input type="hidden" class="invoice-number" id="invoice-number" value="${row[0].invoice_number}" data-id="${row[0].id}">
                                              <input type="hidden" id="total-discount-final" value="${row[0].total_discount_final}">
                                              <input type="text" class="form-control form-control-sm" onkeyup="newDiscountFinal()" id="discount-final-percent" value="${row[0].discount_percent}">
                                          </div>
                                          <div class="mb-2">
                                          <label>Potongan Tunai (Rp)</label>
                                          <input type="text" class="form-control form-control-sm" onkeyup="newDiscountFinal()" id="discount-final-money" value="${row[0].discount_money}">
                                          </div>
                                      </div>`
                      }
                  })
              }
          })
          //content = `<h1>${titleBar}</h1>`
          break;
      case 'discount' :
          width = 800
          height = 400
          frameBoolVal = true
          titleBar = 'Potongan Produk'
          db.all(`select * from sales where invoice_number = '${salesNumber}'`, (err, rows) => {
              if(err) throw err
              if(rows.length < 1) {
                  console.log(`no sales with number '${salesNumber}'`)
              } else {
                  rows.map( (row) => {
                      tr+=`<tr>
                              <td>
                                  <input type="text" class="form-control form-control-sm disable input-product-name" id="input-product-name-${row.id}" value="${row.product_name}" disabled>
                                  <input type="hidden" class="form-control form-control-sm disable input-barcode" id="input-barcode-${row.id}" value="${row.barcode}" disabled>
                                  <input type="hidden" class="input-input-date" id="input-input-date-${row.id}" value="${row.input_date}" data-id="${row.id}">
                                  <input type="hidden" class="input-invoice-number" id="input-invoice-number-${row.id}" value="${row.invoice_number}" data-id="${row.id}">
                                  <input type="hidden" class="input-buyer" id="input-buyer-${row.id}" value="${row.buyer}" data-id="${row.id}">
                                  <input type="hidden" class="input-buyer-id" id="input-buyer-id-${row.id}" value="${row.buyer_id}" data-id="${row.id}">
                                  <input type="hidden" class="input-payment" id="input-payment-${row.id}" value="${row.payment}" data-id="${row.id}">
                                  <input type="hidden" class="input-description" id="input-description-${row.id}" value="${row.description}" data-id="${row.id}">
                                  <input type="hidden" class="input-po-number" id="input-po-number-${row.id}" value="${row.po_number}" data-id="${row.id}">
                                  <input type="hidden" class="input-due-date" id="input-due-date-${row.id}" value="${row.due_date}" data-id="${row.id}">
                                  <input type="hidden" class="input-term" id="input-term-${row.id}" value="${row.term}" data-id="${row.id}">
                                  <input type="hidden" class="input-sales-admin" id="input-sales-admin-${row.id}" value="${row.sales_admin}" data-id="${row.id}">
                                  <input type="hidden" class="input-cost-of-product" id="input-cost-of-product-${row.id}" value="${row.cost_of_product}" data-id="${row.id}">
                                  <input type="hidden" class="input-total" id="input-total-${row.id}" value="${row.total}" data-id="${row.id}">
                                  <input type="hidden" class="input-prd-price" id="input-prd-price-${row.id}" value="${row.price}" data-id="${row.id}">
                                  <input type="hidden" class="input-qty" id="input-qty-${row.id}" value="${row.qty}" data-id="${row.id}">
                                  <input type="hidden" class="input-unit" id="input-unit-${row.id}" value="${row.unit}" data-id="${row.id}">
                              </td>
                              <td>
                                  <input type="text" class="form-control form-control-sm disable input-product-code" id="input-product-code-${row.id}" value="${row.product_code}" disabled>    
                              </td>
                              <td>
                                  <input type="text" class="form-control form-control-sm input-discount-percent" onkeyup="newTotal(${row.id})" value="${row.discount_percent}" id="input-discount-percent-${row.id}">
                              </td>
                              <td>
                                  <input type="text" class="form-control form-control-sm input-discount-money" onkeyup="newTotal(${row.id})" value="${row.discount_money}" id="input-discount-money-${row.id}">
                              </td>
                          </tr>`
                  })
                  content = `<div class="mb-2">
                                  <small>* Silahkan beri diskon sesuai dengan jenis yang diinginkan (% atau tunai (Rp) atau kedua-duanya)</small><br>
                                  <small>* Masukkan persentase potongan tanpa diikuti tanda % dan jumlah potongan tanpa diikuti tanda Rp</small><br>
                              </div>
                              <div class="table-responsive">
                                  <table class="table table-sm table-borderless" style="font-size:13px;">
                                      <thead class="thead-light">
                                          <tr>
                                              <th>Nama Produk</th>
                                              <th>Kode Produk</th>
                                              <th>Potongan (%)</th>
                                              <th>Potongan (Rp)</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          ${tr}
                                      </tbody>
                                  </table>    
                              </div>`
              }
          })
          //content = `<h1>${titleBar}</h1>`
          break;
      case 'qty' :
          width = 700
          height = 400
          frameBoolVal = true
          titleBar = 'Edit Qty'
          db.all(`select * from sales where invoice_number = '${salesNumber}'`, (err, rows) => {
              if(err) throw err
              if(rows.length < 1) {
                  console.log(`no sales with number '${salesNumber}'`)
              } else {
                  rows.map( (row) => {
                      tr+=`<tr>
                              <td>
                                  <input type="text" class="form-control form-control-sm disable input-product-name" id="input-product-name-${row.id}" value="${row.product_name}" disabled>
                                  <input type="hidden" class="form-control form-control-sm disable input-barcode" id="input-barcode-${row.id}" value="${row.barcode}" disabled>
                                  <input type="hidden" class="input-input-date" id="input-input-date-${row.id}" value="${row.input_date}" data-id="${row.id}">
                                  <input type="hidden" class="input-invoice-number" id="input-invoice-number-${row.id}" value="${row.invoice_number}" data-id="${row.id}">
                                  <input type="hidden" class="input-buyer" id="input-buyer-${row.id}" value="${row.buyer}" data-id="${row.id}">
                                  <input type="hidden" class="input-buyer-id" id="input-buyer-id-${row.id}" value="${row.buyer_id}" data-id="${row.id}">
                                  <input type="hidden" class="input-payment" id="input-payment-${row.id}" value="${row.payment}" data-id="${row.id}">
                                  <input type="hidden" class="input-description" id="input-description-${row.id}" value="${row.description}" data-id="${row.id}">
                                  <input type="hidden" class="input-po-number" id="input-po-number-${row.id}" value="${row.po_number}" data-id="${row.id}">
                                  <input type="hidden" class="input-due-date" id="input-due-date-${row.id}" value="${row.due_date}" data-id="${row.id}">
                                  <input type="hidden" class="input-term" id="input-term-${row.id}" value="${row.term}" data-id="${row.id}">
                                  <input type="hidden" class="input-sales-admin" id="input-sales-admin-${row.id}" value="${row.sales_admin}" data-id="${row.id}">
                                  <input type="hidden" class="input-cost-of-product" id="input-cost-of-product-${row.id}" value="${row.cost_of_product}" data-id="${row.id}">
                                  <input type="hidden" class="input-total" id="input-total-${row.id}" value="${row.total}" data-id="${row.id}">
                                  <input type="hidden" class="input-prd-price" id="input-prd-price-${row.id}" value="${row.price}" data-id="${row.id}">
                                  <input type="hidden" class="input-unit" id="input-unit-${row.id}" value="${row.unit}" data-id="${row.id}">
                                  <input type="hidden" class="input-discount-percent" id="input-discount-percent-${row.id}" value="${row.discount_percent}" data-id="${row.id}">
                                  <input type="hidden" class="input-discount-money" id="input-discount-money-${row.id}" value="${row.discount_money}" data-id="${row.id}">
                              </td>
                              <td>
                                  <input type="text" class="form-control form-control-sm disable input-product-code" id="input-product-code-${row.id}" value="${row.product_code}" disabled>    
                              </td>
                              <td>
                                  <input type="text" class="form-control form-control-sm input-qty" onkeyup="newTotal(${row.id})" value="${row.qty}" id="input-qty-${row.id}" data-id="${row.id}">
                              </td>
                              <td>
                                  <input type="text" class="form-control form-control-sm disable" id="input-unit-${row.id}" value="${row.unit}" disabled>
                              </td>
                          </tr>`
                  })
                  content = `<div class="table-responsive">
                                  <table class="table table-sm table-borderless" style="font-size:13px;">
                                      <thead class="thead-light">
                                          <tr>
                                              <th>Nama Produk</th>
                                              <th>Kode Produk</th>
                                              <th>Qty</th>
                                              <th>Unit</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          ${tr}
                                      </tbody>
                                  </table>    
                              </div>`
              }
          })
          //content = `<h1>${titleBar}</h1>`
          break;
      case 'checkout' :
          width = 400
          height = 400
          frameBoolVal = true
          titleBar = 'checkout'
          content = `<div class="table-responsive">
                          <table class="table table-borderless mb-5">
                              <tbody>
                                  <tr>
                                      <td>Total Belanja</td>
                                      <td><input type="text" id="total-sales" style="text-align:right;font-size:20px;" class="form-control" disabled value="${totalSales}"></td>
                                  </tr>
                                  <tr>
                                      <td>Total Diterima</td>
                                      <td><input type="text" id="total-received" style="text-align:right;font-size:20px;" class="form-control" onkeyup="cashReturn()" autofocus></td>
                                  </tr>
                              </tbody>
                          </table>
                          <table class="table table-borderless">
                              <tbody>
                                  <tr style="background-color:red;color:white">
                                      <td><span style="font-size:18px;">Kembali</span></td>
                                      <td><input type="hidden" id="total-returned" value="0"><span class="float-end" id="info-total-returned" style="font-size:20px;font-weight:bold">0</span></td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>`
              break;
          //content = `<h1>${titleBar}</h1>`
  }

  salesModal = new BrowserWindow(
      {
          webPreferences: {
              nodeIntegration: true,
              contextIsolation: false
          },
          autoHideMenuBar: true,
          width: width,
          height: height,
          parent: cashierWindow,
          modal: true,
          resizable: false,
          minimizable: false,
          frame: frameBoolVal,
          title: titleBar
      }
  )
  remote.enable(salesModal.webContents)
  salesModal.loadFile('modals/sales-modal.html')
  salesModal.webContents.on('dom-ready', () => {
      salesModal.webContents.send('load:tbody-tr', content, title, buyerAddress)
  })
}

ipcMain.on('load:sales-modal', (e, msgSalesNumber, msgTitle, msgTotalSales, msgBuyerInfo) => {
  modalSales(msgSalesNumber, msgTitle, msgTotalSales, msgBuyerInfo)
})

ipcMain.on('update-success:sales-edit', () => {
  salesModal.close()
  cashierWindow.webContents.send('update-success:sales-edit')
})

// terima render print struk
ipcMain.on('print:sales', (e, msgTotalSales, msgTotalReceived, msgTotalReturned, msgBuyerInfo, msgDocId) => {
  printSales(salesNum, msgTotalSales, msgTotalReceived, msgTotalReturned, msgBuyerInfo, msgDocId )
})

// FUNCTION NUMBER FORMAT UTK UANG KEMBALIAN
numberFormat = (number) => {
  let numFormat = new Intl.NumberFormat('de-DE').format(number)
  return numFormat
}

// JENDELA WINDOWS UTK STRUK KEMBALIAN
printSales = (salesNumber, totalSales, totalReceived, totalReturned, buyerInfo, docId) => {
  printSalesPage = new BrowserWindow({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation: false
    },
    autoHideMenuBar : true
  })

  // buat tanggal
  let salesDate 
  let d = new Date()
  let date = d.getDate().toString().padStart(2,0)
  let month = d.getMonth().toString().padStart(2,0)
  let year = d.getFullYear()
  salesDate = `${date}/${month}/${year}`

  // info store utk print struk
  let storeInfo = {}
  db.all(`select * from profil order by id asc limit 1`, (err, row) => {
    if(err) throw err
    if(row.length < 1) {
      storeInfo.name = 'My Store'
      storeInfo.address = 'Address'
      storeInfo.taxNumber = ''
      storeInfo.telp = ''
      storeInfo.logo = 'shop.png'
    } else {
      storeInfo.name = row[0].store_name
      storeInfo.address = row[0].store_address
      if(row[0].store_tax_id != '' || row[0].store_tax_id == null){
        storeInfo.taxNumber = ''
      } else {
        storeInfo.taxNumber = `NPWP. ${row[0].store_tax_id}`
      }
      if(row[0].phone_number == '' || row[0].phone_number == null){
        storeInfo.telp = ``
      } else {
        storeInfo.telp = `| Telp. ${row[0].phone_number}`
      } if (row[0].logo == ``){
        storeInfo.logo = `shop.png`
      } else {
        storeInfo.logo = row[0].logo
      }
    }
  })

  let salesHeader = {
    date : salesDate,
    number : salesNumber,
    admin : firstName,
    buyerAddress : buyerInfo
  }

  let salesRecord = ``
  db.all(`select * from sales where invoice_number = '${salesNumber}'`, (err, rows) => {
    if (err) throw err
    if (rows.length < 1) {
      console.log(`Tidak ada data untuk di print.`)
    } else {
      let subTotal = 0
      salesHeader.admin = firstName
      rows.map((row) => {
        let discountPercent = row.discount_percent
        let discountMoney = row.discount_money
        let discountInfo
        if(discountPercent == '' && discountMoney == ''){
          discountInfo = ''
        } else if(discountPercent !='' && discountMoney == '') {
          discountInfo = `${discountPercent}%`
        } else if (discountPercent != '' && discountMoney != '') {
          discountInfo = `${discountPercent}%+${numberFormat(discountMoney)}`
        } else if (discountPercent == '' && discountMoney != ''){
          discountInfo = `${numberFormat(discountMoney)}`
        }
        subTotal+= parseFloat(row.total)
        salesRecord += `
          <tr>
            <td>${row.product_name} (${row.qty}x${numberFormat(row.price)})</td>
            <td>${discountInfo}</td>
            <td><span class="float-end">${numberFormat(row.total)}</span></td>
          </tr>
        `
        salesFooter.subTotal = numberFormat(subTotal)
      })
    }
  })

  let salesFooter = {
    grandTotal : numberFormat(totalSales),
    totalCashReceived : numberFormat(totalReceived),
    totalCashReturned : numberFormat(totalReturned)
  }

  db.all(`select * from discount_final where invoice_number = '${salesNumber}'`, (err, row) => {
    if (err) throw err
    if(row.length < 1) {
      salesFooter.discountFinal = ''
    } else {
      let discountPercent = row[0].discount_percent
      let discountMoney = row[0].discount_money
      let discountFinalInfo
      if(discountPercent == '' && discountMoney == '') {
        discountFinalInfo = ''
      } else if(discountPercent != '' && discountMoney == ''){
        discountFinalInfo = `${discountPercent}%`
      } else if (discountPercent != '' && discountMoney != ''){
        discountFinalInfo = `${discountPercent}%+${numberFormat(discountMoney)}`
      } else if(discountPercent == '' && discountMoney != ''){
        discountFinalInfo = `${numberFormat(discountMoney)}`
      }
      salesFooter.discountFinal = discountFinalInfo
    }
    db.all(`select * from sales_tax where invoice_number = '${salesNumber}'`, (err, row) => {
      if(err) throw err
      if(row.length < 1) {
        salesFooter.tax = ''
      } else {
        salesFooter.tax = numberFormat(row[0].total_tax)
      }
    })
  })

  remote.enable(printSalesPage.webContents)

  printSalesPage.loadFile('windows/receipt.html')
  printSalesPage.webContents.on('dom-ready', () => {
    printSalesPage.webContents.send('load:print', salesRecord, storeInfo, salesHeader, salesFooter)
  })
}

// terima render print sales struk belanja dari receipt.html
ipcMain.on('print:sales-evidence', (e, docId) => {
  switch(docId){
    case 'cashier' :
      cashierWindow.webContents.send(`load:blank-sales`)
      salesModal.close()
      break;
  }
  printSalesPage.webContents.print({
    printBackground : true
  }), () => {
    db.run(`insert into sales_evidence_info(invoice_number, print_status) values('${sales_number}', 'printed)`, err => {
      if(err) throw err
    }) 
    printSalesPage.close()
    salesNum = ''
  }
  printSalesPage.on('close', () => {
    printSalesPage = null,
    salesNum = ''
  })
})

// function modalBuyer jendela windows
modalBuyer = () => {
  buyerModal = new BrowserWindow({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation : false
    },
    autoHideMenuBar : true,
    width : 300,
    height : 400,
    parent : cashierWindow,
    modal : true,
    resizable : false,
    title : 'Tambah data buyer / customer'
  })
  remote.enable(buyerModal.webContents)
  buyerModal.loadFile('modals/buyer-form.html')
  buyerModal.on('close', () => {
    cashierWindow.webContents.send('load:buyer-select')
  })
}

// terima render load buyer
ipcMain.on('load:buyer-form', () => {
  modalBuyer()
})

// Jendela halaman data penjualan
salesWin = () => {
  const{width, height} = screen.getPrimaryDisplay().workAreaSize
  salesWindow = new BrowserWindow({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation : false
    },  
    autoHideMenuBar : true,
    width,
    height,
    title: `kasir.app.v1.0 | Data Penjualan`,
  })
remote.enable(salesWindow.webContents)
salesWindow.loadFile('windows/sales-data.html')
salesWindow.webContents.on('did-finish-load', () => {
  mainWindow.hide()
})
salesWindow.on('close', () => {
  mainWindow.show()
})
}

// terima render halaman data penjualan
ipcMain.on('load:sales-data-window', () => {
  salesWin()
})

// close sales data
ipcMain.on('close:sales-data', () => {
  salesWindow.close()
})

// Jendela halaman laporan penjualan
salesReportWin = () => {
  const{width, height} = screen.getPrimaryDisplay().workAreaSize
  salesReportWindow = new BrowserWindow({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation : false
    },  
    autoHideMenuBar : true,
    width,
    height,
    title: `kasir.app.v1.0 | Laporan Penjualan`,
  })
remote.enable(salesReportWindow.webContents)
salesReportWindow.loadFile('windows/sales-report.html')
salesReportWindow.webContents.on('did-finish-load', () => {
  mainWindow.hide()
})
salesReportWindow.on('close', () => {
  mainWindow.show()
})
}

// close sales report
ipcMain.on("close:sales-report", () => {
  salesReportWindow.close();
});


// terima render halaman laporan penjualan
ipcMain.on('load:sales-report-window', () => {
  salesReportWin()
})

// Jendela halaman chart
chartWin = () => {
  const{width, height} = screen.getPrimaryDisplay().workAreaSize
  chartWindow = new BrowserWindow({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation : false
    },  
    autoHideMenuBar : true,
    width,
    height,
    title: `kasir.app.v1.0 | Diagram Penjualan`,
  })
remote.enable(chartWindow.webContents)
chartWindow.loadFile('windows/chart.html')
chartWindow.webContents.on('did-finish-load', () => {
  mainWindow.hide()
})
chartWindow.on('close', () => {
  mainWindow.show()
})
}

// terima render close chart
ipcMain.on('close:sales-chart', () => {
  chartWindow.close()
})

// terima render halaman laporan penjualan
ipcMain.on('load:chart-window', () => {
  chartWin()
})

// Jendela halaman buyer
buyerWin = () => {
  const{width, height} = screen.getPrimaryDisplay().workAreaSize
  buyerWindow = new BrowserWindow({
    webPreferences : {
      nodeIntegration : true,
      contextIsolation : false
    },  
    autoHideMenuBar : true,
    width,
    height,
    title: `kasir.app.v1.0 | Data Customer`,
  })
remote.enable(buyerWindow.webContents)
buyerWindow.loadFile('windows/buyer.html')
buyerWindow.webContents.on('did-finish-load', () => {
  mainWindow.hide()
})
buyerWindow.on('close', () => {
  mainWindow.show()
})
}

// close buyer
ipcMain.on('close:buyer-data', () => {
  buyerWindow.close()
})

// terima render halaman laporan penjualan
ipcMain.on('load:buyer-window', () => {
  buyerWin()
})

// terima render setting
ipcMain.on('load:setting', (e, msgParam) => {
  switch(msgParam){
    case 'general' :
      modalGeneralSetting()
      break
    case 'user' :
      modalUserSetting()
      break
    default :
    modalProfilSetting()
    
  }
})

// terima render update user
ipcMain.on(`success:update-user`, () => {
  editDataModal.close()
  userSettingModal.webContents.send('success:update-user')
})

// kodingan script package.json untuk export ke win7.exe pda npm run-package

    // "package-win": "electron-packager . --overwrite --platform=win32 --arch=x64 --electron-version=12.0.0 --icon=assets/img/icons/cashier-logo.ico --prune=true --out=./dist/win64"
    
    