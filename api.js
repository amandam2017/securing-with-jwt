const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const api = (app, db) => {
    app.post('/api/users', async function (req, res) {
        const { username, password } = req.body

        let userData = await db.one('select count(*) from love_user where username = $1 AND pass = $2', [username, password])

        if (userData.count == 0) {
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(password, salt, async function (err, hash) {
                    await db.none('insert into love_user (username, pass) values ($1, $2)', [username, hash]);
                });
            });
            // await db.none('insert into love_user (username, pass) values ($1, $2)', [username, password]);
            res.json({
                message: 'User successfuly registered',
                data: userData
            })
        }
        else {
            res.json({
                message: 'User already registered please login with username',
                status: 401
            })
        }


    })

    app.post('/api/login', async function (req, res) {
        const { username, password } = req.body

        let user = await db.one('select count(*) from love_user where username = $1 AND pass = $2', [username, password])
        
        let token = jwt.sign(user, 'secretKey', { expiresIn: '24h' });
        console.log(user);

        if (user == 0) {
            res.json({
                message: 'Oop! Your are not registered please do so',
                status: 401
            });
        }
        else {
            res.json({
                message: `you are logged in ${username}`,
                data:token

            })
        }
    })

    app.get('/test', (req, res) => res.json({ user: 'john' }))
}
module.exports = api;