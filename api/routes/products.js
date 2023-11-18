const express =require('express');
const Product = require('../models/product');
const mongoose = require('mongoose');
const router=express.Router();
const multer = require('multer');
const checkAuth=require("../middleware/check-auth")
const storage =multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./uploads/");
    },filename:function(req,file,cb){
        cb(null,new Date().toISOString()+file.originalname);
    }
})
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg'||file.mimetype==='image/png'){ cb(null,true);}
    else{cb(null,false);}
}
const upload=multer({storage:storage,limits:{fileSize:1024*1024*5},fileFilter:fileFilter})
router.get('/',(req,res,next)=>{
    Product.find().select("name price _id productImage").exec().then(docs=>{
        console.log(docs);
        const response={count:docs.length,products:docs.map(doc=>{
            return{
                name:doc.name,
                price:doc.price,
                productImage:doc.productImage,
                _id:doc._id,
                request:{
                    type:"GET",
                    url:"https://localhost:3000/"+doc._id
                }
            }
        })}
        res.status(200).json(response);
    })
    .catch(err=>{
        res.status(500).json({error:err})
    })
})
router.post('/',checkAuth,upload.single('productImage'),(req,res,next)=>{
    const product=new Product({_id:new mongoose.Types.ObjectId(),name:req.body.name,price:req.body.price,productImage:req.file.path,})
    product.save()
    .then(result=>{
        res.status(201).json({
            message:"Created product successfully",
            createdProduct:{
                name:result.name,
                price:result.price,
                _id:result._id,
                productImage:req.file.path,
                request:{
                    type:"GET",
                    url:"https://localhost:3000/"+result._id
                }
            }
        })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
})
router.get('/:productId',(req,res,next)=>{
    const id=req.params.productId;
    Product.findById(id).select("name price _id productImage").exec().then(doc=>{
        if(doc){res.status(200).json({product:doc,request:{type:"GET",description:"Get all products",url:"http://localhost/product"}})}
        else{res.status(404).json({message:"No valid entry for provided ID"})}
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err})
    });

})
router.patch('/:productId',checkAuth,(req,res,next)=>{
    const id=req.params.productId;
    const updateOps={};
    for(const ops of req.body){
        updateOps[ops.propName]=ops.value;
    }
    Product.updateOne({_id:id},{$set:updateOps}).exec().then(result=>{
        
        res.status(200).json({message:"Product updated",requests:{type:"GET",url:"http://localhost:3000/products/"+id}})
    }).catch(err=>{
        console.log(err);
        res.status(500).json({error:err})
    });
})
router.delete('/:productId',checkAuth,(req,res,next)=>{
    const id=req.params.productId;
    Product.deleteOne({_id:id}).exec().then(result=>{
        res.status(200).json({message:"product deleted"});
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
})
module.exports=router;