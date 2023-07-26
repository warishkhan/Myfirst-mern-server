const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const userSchema = new mongoose.Schema({
    name:{
        type:'string',
        required: true
    },
    email:{
        type:'string',
        required: true
    },
    phone:{
        type:'string',
        required: true
    },
    work:{
        type:'string',
        required: true
    },
    password:{
        type:'string',
        required: true
    },
    cpassword:{
        type:'string',
        required: true
    },
    date:{
        type:Date,
        default : Date.now()
    },
    messages:[
        {
            name:{
                type:'string',
                required: true
            },
            email:{
                type:'string',
                required: true
            },
            phone:{
                type:'string',
                required: true
            },
            message:{
                type:'string',
                required: true
            },  
        }
    ],
    tokens:[
        {
            token:{
                type:"String",
                required: true
            },
        }
    ]
});

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12);
        this.cpassword = await bcrypt.hash(this.cpassword,12);
    }
    next();
    
})

userSchema.methods.generateAuthToken = async function(){
   try {
    const token = jwt.sign({'_id':this._id},process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({token:token});
    await this.save();
    return token;
   } catch (error) {
    console.log(error);
   }
}

// stored the message

userSchema.methods.addMessage = async function (name,email,phone,message){
    try {
        this.messages = this.messages.concat({name,email,phone,message});
        await this.save() ;
        return this.messages;
    } catch (error) {
        console.log(error);
    }
}

const User = mongoose.model('User',userSchema);
module.exports = User;