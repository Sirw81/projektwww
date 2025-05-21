import express from "express"
import mariadb from "mariadb"

const app = express()
const PORT = 3000
app.use(express.static('public'))

app.get('/', function(req, res) {
    res.set({ 'Access-control-Allow-Origin': '*' });
    return res.redirect('index.html')
}).listen(3000)

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}/`)
})

const pool = mariadb.createPool({
     host: 'mydb.com',
     user:'myUser',
     password: 'myPassword',
     connectionLimit: 5
})