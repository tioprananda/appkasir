

// function kosongkan input
blankForm = () => {
   $('#name').val('')
   $('#address').val('')
   $('#website').val('')
   $('#telp-one').val('')
   $('#telp-two').val('')
   $('#email').val('')
   $('#name').focus()
}

// CRUD INSERT DATA BUYER
addBuyerData = () => {
    let name = $('#name').val()
    let address = $('#address').val()
    let website = $('#website').val()
    let telpOne = $('#telp-one').val()
    let telpTwo = $('#telp-two').val()
    let email = $('#email').val()

    let queryInsert =`insert into buyers(name, address, website, telp_one, telp_two, email) values('${name}', '${address}', '${website}', '${telpOne}', '${telpTwo}', '${email}')`;
    let queryCheck = `select count(*) as row_number from buyers where name = "${name}"`;
    if(name != ''){
        db.all(queryCheck, (err, row) => {
            if(err) throw err
            let rowNum = parseInt(row[0].row_number)
            console.log(rowNum)
            if(rowNum < 1) {
                db.run(queryInsert, err => {
                    if (err) throw err
                    dialog.showMessageBoxSync({
                        title : `Success`,
                        message : `Data buyer / customer berhasil disimpan.`
                    })
                    blankForm()
                })
            } else {
                dialog.showMessageBoxSync({
                    title : `alert`,
                    type : `info`,
                    message : `Nama buyer / customer sudah ada, silahkan masukan nama lain. `
                })
            }
        })
    } else {
        dialog.showMessageBoxSync({
            title : `alert`,
            type : `info`,
            message : `Nama buyer / customer harus diisi. `
        })
    }
}

$(document).keydown(function(e){
    if(e.keyCode === 13) {
        addBuyerData()
    }
})