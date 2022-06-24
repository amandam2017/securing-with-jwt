const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const api = (app, db) => {
    app.post('/api/users', async function (req, res) {
        const { username, password } = req.body

        let userData = await db.oneOrNone('select * from love_user where username = $1 AND pass = $2', [username, password])

        if (userData === null) {
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

            // const comparePass = await bcrypt.compare(password, user.pass);

            // if (comparePass) {
            //     res.json({
            //         message: 'user already exist',
            //         status: 401
            //     });

            // }
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

        let user = await db.oneOrNone('select * from love_user where username = $1', [username])

        console.log({ user });

        if (user == null) {
            res.json({
                message: 'Oop! Your are not registered please do so',
                status: 401
            });
        }

        if (user !== null) {
            const comparePass = await bcrypt.compare(password, user.pass);
            if (!comparePass) {
                res.json({
                    message: 'Oop! Pass not match',
                    status: 401
                });

            } else {
                let token = jwt.sign(user, 'secretKey', { expiresIn: '24h' });

                res.json({
                    message: `you are logged in ${username}`,
                    data: token

                })
            }
        }

        const authanticateToken = (req, res, next) => {
            // inside this function we want to get the token that is generated/sent to us and to verify if this is the correct user.
            const authHeader = req.headers['authorization']
            // console.log({authHeader});
            const token = authHeader && authHeader.split(" ")[1]
            // if theres no token tell me
            if (token === null) return res.sendStatus(401)
            // if there is then verify if its the correct user using token if not return the error
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, username) => {
                // console.log(err);
                if (err) return res.sendStatus(403)
                console.log('show error' + err);

                req.username = username
                console.log(username);
                next()
            })

        }

        app.post('/api/counter', authanticateToken, async function (req, res) {
            const userName = req.body
            await db.oneOrNone('UPDATE love_user SET lovecounter = lovecounter+1 WHERE username = $1', [userName]);
            const heart = await hearts(userName)
            res.json({
                data: heart
            })
        })

        async function hearts(userName) {
            const loveCounter = await db.oneOrNone('select lovecounter from love_user where user = $1', [userName]);
            if (loveCounter <= 0) {
                return "💔"
            }

            if (loveCounter > 0 && loveCounter <= 5) {
                return "💚"
            } else if (loveCounter <= 10) {
                return "💚💚";
            } else {
                return "💚💚💚";
            }
        }

        // else {
        //     res.json({
        //         message: `you are logged in ${username}`,
        //         data:token

        //     })
        // }
    })

    app.get('/test', (req, res) => res.json({ user: 'john' }))
}
module.exports = api;