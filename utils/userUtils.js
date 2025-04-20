const path = require('path')
const fs = require('fs/promises');

const usersfile = path.join(__dirname,'../data/users.json')

async function getUsers() {
    try {
        const data = await fs.readFile(usersfile,'utf-8')
        return JSON.parse(data)
    } catch (error) {
        console.error("Error reading file",error);
        return []
    }
}

async function saveUsers(users) {
    try {
        await fs.writeFile(usersfile,JSON.stringify(users,null,2))
    } catch (error) {
        console.error("Error saving users",error);
    }    
}

//add users

async function addUsers(newUser) {
    const users = await getUsers();
    users.push(newUser);

    await saveUsers(users);
}

module.exports = {
    getUsers,
    saveUsers,
    addUsers
}