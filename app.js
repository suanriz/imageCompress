const express = require("express");
const cors = require("cors");
const path = require("path");

const imagesRouter = require("./routes/images");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/images", imagesRouter);

app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Page not found" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
