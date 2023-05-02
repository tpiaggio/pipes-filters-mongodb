const express = require('express')
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/task-manager');
const userRouter = require('./routes/user');
const messageRouter = require('./routes/message');

const app = express()
const port = 3000

app.use(express.json())
app.use(userRouter);
app.use(messageRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
