const {getUsers,addUsers, saveUsers} = require('../utils/userUtils')
const express = require('express');
const path = require('path')
const fs = require('fs/promises')
const bcrypt = require('bcryptjs')
const router = express.Router();

const usersFile = path.join(__dirname,'../data/users.json')

//signup get

router.get('/signup', (req, res) => {
    res.render('signup');
  });
router.post('/signup',async(req,res)=>{
    const {username,email, password} = req.body;

    if (!username || !email || !password) {
        return res.render('signup', { error: 'Username email and password are required.' });
    }

    try {
        const users = await getUsers();
        const existingUser = users.find((u)=> u.username === username || u.email === email)

        if (existingUser) {
            return res.render('signup', { error: 'Username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = {username,email,password:hashedPassword}

        await addUsers(newUser);

        return res.render('login', { success: 'User registered and account created successfully.' });
    } catch (error) {
        console.error('Signup Error:', error);
        res.render('signup', {error: "Something went wrong"});
    }
})

router.get('/login', (req, res) => {
    return res.render('login');
  });

router.get('/product',(req,res)=>{
    const username = req.session.username;

    if (!username) {
        return res.redirect('/login')
    }

    res.render('product',{
        username: req.session.username
    })
})

router.post('/login',async(req,res)=>{
    const {username,password} = req.body;

    if (!username || !password) {
        return res.render('login', { error: 'Please enter username and password.' });
    }

    try {
        const users = await getUsers();
        const user = users.find((u)=> u.username === username)

        if (!user) {
            return res.render('login', { error: 'User not found. Please sign up.' });
        }
        const isMatch = await bcrypt.compare(password,user.password)

        if (!isMatch) {
            return res.render('login', { error: 'Password not match. Please try again.' });
        }

        // creating a session 

        req.session.username = username;

        res.redirect('/product')
    } catch (error) {
        console.error("Login error",error);
        return res.render('login', { error: 'Something went wrong. Please try again.' });
    }
});
// reseting password logic

router.get('/forgot-password',(req,res)=>{
    res.render('forgot-password')
})

router.post('/forgot-password',async(req,res) =>{
    const {email} = req.body;

    const users = await getUsers();

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.render('signup',{
            message : "you haven't stored your email yet or email not found",
            messageType: "error",
        })
    }

    req.session.resetemail = email;

    res.redirect('/reset-password')

})

//final step to reset password

router.get('/reset-password',(req,res)=>{
    if (!req.session.resetemail) {
        return res.redirect('/login')
    }

    res.render('reset-password')
})

router.post('/reset-password',async(req,res)=>{
    const {password} = req.body;

    const email = req.session.resetemail;

    if (!email) {
        return res.redirect('/login')
    }

    const users = await getUsers();
    // finding the email in the data

    const indx = users.findIndex(u => u.email === email)

    if (indx === -1) {
        return res.send("No account found for this email")
    }

    const hashed = await bcrypt.hash(password,10)

    users[indx].password = hashed;

    await saveUsers(users);

    //clear the session 

    delete req.session.resetemail;

    res.redirect('/login');
})
//logging out and destroying the session

router.get('/logout',(req,res)=>{
    req.session.destroy(err =>{
        if (err) {
            console.error("Error loging out",err);
        }
        res.redirect('/login?message=You have been logged out')
    })
})

module.exports = router;