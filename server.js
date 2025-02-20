import express from 'express'
import mongoose from 'mongoose';

const app = express()
const port = 4004

try {
    await mongoose.connect(process.env.url);
    console.log('Connected to MongoDB');
    
    app.listen(port, () => {
      console.log(`Server Running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
}

const userschema = new mongoose.Schema({
  username:String,
  email:String,
  password:String
})
const User = mongoose.model('User',userschema)

app.use(express.json())

app.set('viewengine','ejs')

app.get('/',(req,res)=>{
  res.render("home")
})  