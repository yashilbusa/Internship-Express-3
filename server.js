import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import validator from 'validator';

dotenv.config();

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

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true })); 

app.set('view engine','ejs')

app.get('/',(req,res)=>{
  res.render("home")
})  

app.get('/login',(req,res)=>{
  res.render("login")
})  

app.get('/signup',(req,res)=>{
  res.render("signup")
})  

app.post('/signup', async(req,res)=>{

  const data = {
    username:req.body.username,
    email:req.body.email,
    password:req.body.password
  }

  if (!validator.isEmail(req.body.email)) {
    return res.send("Invalid email format.");
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(req.body.password)) {
    return res.send("Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.");
  }


  console.log('Received data:', data);

  const checkUser = await User.findOne({username: data.username, email: data.email})

  if(checkUser){
    res.send("User Already Exits. Please Choose a Different Username or Email")
  } else {

    const hashPassword = await bcrypt.hash(data.password, 10)
    data.password = hashPassword

    const userData = new User(data); 
    await userData.save(); 
    res.render("login")
  }
})

app.post('/login', async(req,res)=>{
  try {
      const checkUser = await User.findOne({username: req.body.username, email: req.body.email})
      if(!checkUser){
        res.send("User Not Found")
      }

      const isPasswordMatch = await bcrypt.compare(req.body.password, checkUser.password)

      if(isPasswordMatch){
        const token = jwt.sign({ userId: checkUser._id, username: checkUser.username }, process.env.JWT_SECRET, {
          expiresIn: '1h'
        });
      res.json({ message: 'Login successful', token });
      res.render("shop")

      }else{
        res.send("Incorrect Password !!!")
      }

  } catch (err) {
      res.send("Incorrect Details !!!")
  }
})