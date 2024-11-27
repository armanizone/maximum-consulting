import express from "express";
import sqlite3 from "sqlite3";
import bodyParser from "body-parser";
import cors from "cors";

const sql = sqlite3.verbose();

const app = express();
const port = 1001;

app.use(
  bodyParser.json(),
  cors({
    origin: "http://localhost:5173",
  })
);

const db = new sql.Database("./database.db", (err) => {
  if (err) {
    console.error(err.message)
  } else {
    console.log('database connected')
  }
});

app.post("/transactions", (req, res) => {
  const { dateTime, author, sum, category, comment } = req.body
  const query = `
        INSERT INTO transactions (dateTime, author, sum, category, comment)
        VALUES (?, ?, ?, ?, ?)
    `;

  db.run(
    query,
    [dateTime, author, sum, category, comment || null],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message })
      }
      res.status(201).json({
        id: this.lastID,
        dateTime,
        author,
        sum,
        category,
        comment,
      })
    }
  )
})

app.get("/transactions", (req, res) => {
  const query = "SELECT * FROM transactions"

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(rows)
  })
})

app.get("/transactions/:id", (req, res) => {
  const query = "SELECT * FROM transactions WHERE id = ?"
  const transactionId = req.params.id

  db.get(query, [transactionId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (!row) {
      return res.status(404).json({ error: "Транзакция не найдена" })
    }
    res.json(row)
  })
})

app.put("/transactions/:id", (req, res) => {
  const { dateTime, author, sum, category, comment } = req.body
  const query = `
        UPDATE transactions
        SET dateTime = ?, author = ?, sum = ?, category = ?, comment = ?
        WHERE id = ?
    `;
  const transactionId = req.params.id

  db.run(
    query,
    [dateTime, author, sum, category, comment || null, transactionId],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message })
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Транзакция не найдена" })
      }
      res.json({
        id: transactionId,
        dateTime,
        author,
        sum,
        category,
        comment,
      })
    }
  )
})

app.delete("/transactions/:id", (req, res) => {
  const query = "DELETE FROM transactions WHERE id = ?";
  const transactionId = req.params.id;

  db.run(query, [transactionId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Транзакция не найдена" })
    }
    res.status(204).send();
  })
})

app.listen(port, () => {
  console.log({ status: "ok" });
})