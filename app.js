const dotenv = require('dotenv');

const express = require('express');
const app = express();

dotenv.config({path:'./.env'})

require('./database/conn')

app.use(express.json());
app.use(require('./router/auth'));

const port = process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send('hello I m the best in the world');
})

app.listen(port,()=>{
    console.log(`ser is running on the port ${port}`);
})