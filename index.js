require('dotenv').config()
const {Helper} = require("./Helper");
const sqlite3 = require('sqlite3').verbose()
const express = require('express')
const app = express()
app.use(express.json())

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.log(err)
    console.log("Connected to DB");
})

db.run(`CREATE TABLE IF NOT EXISTS complaint (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        status TEXT DEFAULT open,
        timestamp DATETIME DEFAULT ${Date.now()},
        sentiment TEXT DEFAULT unknown,
        category TEXT DEFAULT другое,
        ip INTEGER,
        country TEXT,
        city TEXT
    )`
)

app.post('/complaint', async (req, res) => {
    const {ip, text} = req.body
    const {country, city} = await Helper.ipApi(ip)
    const sentiment = await Helper.sentimentApi(text) ?? "unknown"
    const category = await Helper.openAI(text) ?? "другое"

    db.run(
        ` INSERT INTO complaint (text, sentiment, category, ip, country, city) VALUES (?,?,?,?,?,?)`,
        [text, sentiment, category, ip, country, city],
        function (err) {
            if (err) return res.status(500).json({error: err.message})
            return res.status(201).json({id: this.lastID, status: "open", sentiment, category})
        }
    )
})

app.get('/complaint', (req, res) => {
    db.all(` SELECT * FROM complaint WHERE status = "open"`, [], function (err, row) {
        if (err) return res.status(500).json({error: err.message})
        return res.json(row)
    })
})

app.patch('/complaint', (req, res) => {
    const {id, status} = req.body
    db.run(
        `UPDATE complaint SET status = ? WHERE id = ?`,
        [status, id],
        function (err) {
        if (err) return res.status(500).json({error: err.message})
        return res.status(200).json({id, status})
    })
})

app.get('/all', (req, res) => {
    db.all(` SELECT * FROM complaint`, [], function (err, row) {
        if (err) return res.status(500).json({error: err.message})
        return res.json(row)
    })
})

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})
