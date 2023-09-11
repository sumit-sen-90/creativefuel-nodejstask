require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/database").connect();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

//User routes
const userRouter = require("./routes/authRoutes");
app.use("/user", userRouter);

const taskRouter = require("./routes/taskRoutes");
app.use("/task", taskRouter);

app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
