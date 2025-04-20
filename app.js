const express = require('express');
const session = require('express-session')
const exphbs = require('express-handlebars');
const path = require('path')
require('dotenv').config();

const app = express();

//config hbs
app.set('views',path.join(__dirname,'views'));
app.engine('hbs',exphbs.engine({
    extname:'hbs',
    defaultLayout:'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
}));

app.set('view engine','hbs');


//middleware

app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')))

//session setup

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 2 * 60 *1000} //2 min
}));

const authRoutes = require('./routes/auth')

app.use('/',authRoutes);

app.get('/',(req,res)=>{
    res.redirect('/login')
});

app.listen(3000,()=>{
    console.log('✅ Server running at http://localhost:3000');
})