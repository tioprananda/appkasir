// close halaman data penjualan
closeChart = () => {
    ipcRenderer.send('close:sales-chart')
}

//   grafik daily chart
let dailyChartData = {
    labels: [],
    datasets: [
        {
            label: "Penjualan",
            backgroundColor: ['coral'],
            borderColor: ['coral'],
            data: []
        },
        {
            label: "Profit",
            backgroundColor: ['skyblue'],
            borderColor: ['skyblue'],
            data: []
        }
    ]
}

const dailyConfig = {
    type: 'line',
    data: dailyChartData,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
}

// buat diagram
const dailyCtx = document.getElementById('daily-sales').getContext('2d')
const dailyChart = new Chart(dailyCtx, dailyConfig)

// update data diagram pertanggal
dailySalesChart = (month, year) => {
    let dailyQuery = `select sales_table.*, sum(discount_final.total_discount_final) as discount_final from (select date(input_date) as date, sum(total) as total, sum((qty*cost_of_product)) as cogs from sales where substr(date(input_date), 1, 7) = '${year}-${month}' group by date) as sales_table left join discount_final on sales_table.date = date(discount_final.input_date) group by date`

    db.all(dailyQuery, (err, rows) => {
        if(err) throw err
        let dateArray = []
        let salesArray = []
        let profitArray = []
        rows.map( row => {
            let netSales = row.total-row.discount_final
            let profit = netSales-row.cogs
            dateArray.push(row.date)
            salesArray.push(netSales)
            profitArray.push(profit)
        })
        dailyChartData.labels = dateArray
        dailyChartData.datasets[0].data = salesArray
        dailyChartData.datasets[1].data = profitArray
        dailyChart.update()
    })
}

// ganti bulan dan tahun pada diagram daily
changeDailySalesChart = () => {
    let month = $('#daily-sales-month').val()
    let year = $('#daily-sales-year').val()
    dailySalesChart(month, year)
}

// grafik monthly chart
let monthlyChartData = {
    labels: [],
    datasets: [
        {
            label: "Penjualan",
            backgroundColor: ['yellow'],
            borderColor: ['cadetblue'],
            data: []
        },
        {
            label: "Profit",
            backgroundColor: ['lime'],
            borderColor: ['steelblue'],
            data: []
        }
    ]
}

const monthlyConfig = {
    type: 'bar',
    data: monthlyChartData,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
}

// buat diagram
const monthlyCtx = document.getElementById('monthly-sales').getContext('2d')
const monthlyChart = new Chart(monthlyCtx, monthlyConfig)

// update data diagram perbluan
monthlySalesChart = (startMonth, startYear) => {
    let endMonth
    let endYear
    if(startMonth == 01) {
        endMonth = 12
        endYear = startYear
    } else if(parseInt(startMonth) > 1) {
        endMonth = (parseInt(startMonth)-1).toString().padStart(2,0)
        endYear = parseInt(startYear)+1
    }
    let monthlyQuery = `select sales.*, sum(discount_final.total_discount_final) as discount_final from (select annual_sales.date as date, sum(annual_sales.total) as total, sum(annual_sales.cogs) as cogs from (select substr(sales_table.sales_date,1,7) as date, sales_table.total as total, sales_table.cogs as cogs from (select date(input_date) as sales_date, sum(total) as total, sum((qty*cost_of_product)) as cogs from sales where substr(date(input_date), 1, 7) between '${startYear}-${startMonth}' and '${endYear}-${endMonth}' group by sales_date) as sales_table) as annual_sales group by annual_sales.date) as sales left join discount_final on sales.date = substr(date(discount_final.input_date),1,7)`

    db.all(monthlyQuery, (err, rows) => {
        if(err) throw err
        let dateArray = []
        let salesArray = []
        let profitArray = []
        rows.map( row => {
            let netSales = row.total-row.discount_final
            let profit = netSales-row.cogs
            dateArray.push(row.date)
            salesArray.push(netSales)
            profitArray.push(profit)
        })
        monthlyChartData.labels = dateArray
        monthlyChartData.datasets[0].data = salesArray
        monthlyChartData.datasets[1].data = profitArray
        monthlyChart.update()
    })
}


// ganti bulan dan tahun pada diagram monthly
changeMonthlySalesChart = () => {
    let month = $('#monthly-sales-month').val()
    let year = $('#monthly-sales-year').val()
    monthlySalesChart(month, year)
}

// GRAFIK TOP PRODUK
// grafik monthly chart
let topChartData = {
    labels: [],
    datasets: [
        {
            label: "Top Produk",
            backgroundColor: ['green','red','orange','blue','darkcyan'],
            data: []
        },
        
    ]
}

const topConfig = {
    type: 'pie',
    data: topChartData,
}

// buat diagram
const topCtx = document.getElementById('top-sales').getContext('2d')
const topChart = new Chart(topCtx, topConfig)

// update data diagram perbluan
topSalesChart = (month, year) => {
    let topQuery = `
        select product_name, sum(qty) as qty from sales where substr(date(input_date),1,7) = '${year}-${month}' group by product_name order by qty desc limit 5
    `

    db.all(topQuery, (err, rows) => {
        if(err) throw err
        let qtyArray = []
        let prdName = []
        rows.map( row => {
            qtyArray.push(row.qty)
            prdName.push(row.product_name)
        })
        topChartData.labels = prdName
        topChartData.datasets[0].data = qtyArray
        topChart.update()
    })
}


// ganti bulan dan tahun pada diagram top
changeTopSalesChart = () => {
    let month = $('#top-sales-month').val()
    let year = $('#top-sales-year').val()
    topSalesChart(month, year)
}

