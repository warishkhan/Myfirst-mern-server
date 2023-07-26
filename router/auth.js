const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('../database/conn')
const User = require('../model/schema')
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const authenticate = require('../middleware/middleware');

router.get('/',(req,res)=>{
    res.send('hello');
});
router.post('/register', async(req,res)=>{
    const {name,email, phone,work,password,cpassword} = req.body;

    if(!name || !email || !phone || !work || !password || !cpassword){
        return  res.status(401).json({message:'All fields are required'});
    }
    try {
         const userExist = await User.findOne({email:email})
    
         if(userExist){
               return   res.status(422).json({error:'User already exist with this'})
           } else if(password !== cpassword){
            return     res.status(409).json({message:"Passwords do not match"})
           }else{

            const user = new User ({name,email, phone,work,password,cpassword});
        
            const register = await user.save()
               res.status(201).json({message:"user registered successfull"})
           
           }
    
    } catch (error) {
        
        console.log(error + "Error in finding the email");
    }

   
    console.log(req.body);
    })

    router.post('/login', async(req,res)=>{
        const{email , password}= req.body
        if(!email || !password){
            return  res.status(403).json({ message :"Please provide both Email and password"})
        }

        const userLogin = await User.findOne({email:email})
        try{ 
            if(userLogin){
            const isMatch = await bcrypt.compare(password, userLogin.password )

            const token = await userLogin.generateAuthToken();
            console.log(token);

            res.cookie('jwt',token,{
                expires : new Date(Date.now() + 25892000000),
                httpOnly : true
            })
            
            if (!isMatch){return    res.status(401 ).json({message:" invalid login detaild"})}
            else{
                res.status(201).json({message:"login succesfull"})
            }
        }else{
            return  res.status(500).json({error:"something went wrong"})
        }
        }catch(error){
            throw error ;
        }
        console.log(req.body);
    })

    router.get('/account',authenticate,(req,res)=>{
        res.send(req.rootUser);
    });


    router.get('/getdata',authenticate,(req,res)=>{
        res.send(req.rootUser);
    });


    router.post('/contact', authenticate, async(req,res)=>{
        try {
            const {name,email,phone,message} = req.body;
            if(!name || !email || !phone || !message){
                return  res.json({error:"all field is require"})
            }

            const userContact = await User.findOne({_id:req.userId});

            if(userContact){
                const userMessage = await userContact.addMessage(name,email,phone,message);

                await userContact.save();

                res.status(201).json({message:"user contact successfully"});
            }
        } catch (error) {
            console.log(error);
        }
    })

    router.get('/logout',(req,res)=>{
        res.clearCookie('jwt',{path:'/'});
        res.status(200).send('User logout');
    });


// router.post('/register',(req,res)=>{
//     const {name,email, phone,work,password,cpassword} = req.body;

//     if(!name || !email || !phone || !work || !password || !cpassword){
//         return  res.status(401).json({message:'All fields are required'});
//     }

//     User.findOne({email:email})
//     .then((userExist)=>{

//         if(userExist){
//             return   res.status(422).json({error:'User already exist with this'})
//         }
        
//         const user = new User ({name,email, phone,work,password,cpassword});

//     user.save().then(()=>{
//         res.status(201).json({message:"user registered successfull"})
//     }).catch((error)=>{
//         res.status(500).json({ error : "Internal Server Error"})
//     })
//     }).catch((error)=>{
//         console.log(error + "Error in finding the email");
//     })

//     console.log(req.body);
// });

module.exports = router;