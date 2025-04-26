const express = require("express");
const { buy } = require("./buy");
const app = express();

const PORT = process.env.PORT || 4000;
//for send buy signal
app.get("/buy", (req, res) => {
  buy(req,res);
});

app.get("/", (req, res) => {
  res.send("Active");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
