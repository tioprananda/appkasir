let doc_id
let id
ipcRenderer.on(`res:form`, (e, editDocId, editForm, rowId) => {
    $('#edit-form').html(editForm)
    doc_id = editDocId
    id = rowId
    console.log(editForm)
})  

// function ketika tombol ubah ditekan
submitEditData = () => {
    switch(doc_id) {
        case `product-data`:
            submitEditPrdData(id)
            break;
    }
}

// function ketika enter tombol ubah ditekan
$('body').keydown(function (e) {
    if(e.keyCode === 13) {
        submitEditData()
    }
})