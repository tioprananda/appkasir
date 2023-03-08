// panggil sqlite3
const sqlite3 = require('sqlite3').verbose()

// buat db
const db = new sqlite3.Database('./system/db/mycashier.db')

// export db
module.exports = db