const express=require("express");
const bodyParser = require('body-parser');
const app=express();
const productRoutes=require('./api/routes/products')
const orderRoutes=require('./api/routes/orders')
const userRoutes=require('./api/routes/users')
const mongoose = require('mongoose');
const morgan = require('morgan');
mongoose.connect('mongodb+srv://Mrx:'+ process.env.MONGO_ATLAS_PASSWORD +'@cluster.sq7orxw.mongodb.net/?retryWrites=true&w=majority');
mongoose.Promise=global.Promise;
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(morgan('dev'))
app.use("/uploads",express.static("uploads"))
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    if(req.method==='OPTIONS'){
        res.header("Access-Control-Allow-MEthods","PUT,POST,PATCH,DELETE,GET");
        return res.status(200).json({})
    }
    next();
})
app.use('/products',productRoutes)
app.use('/orders',orderRoutes)
app.use('/users',userRoutes)
app.use((req,res,next)=>{
    const error=new Error('Not found');
    error.status=404;
    next(error);
})
app.use((error,req,res,next)=>{
    res.status(error.status||500);
    res.json({
        error:{message:error.message}
    })
})
module.exports=app;