require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors({origin: "*"}));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/transactions", require("./routes/transactions"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
