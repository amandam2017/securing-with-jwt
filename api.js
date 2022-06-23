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
        
        console.log({user});

        if(user == null){
            res.json({
                message: 'Oop! Your are not registered please do so',
                status: 401
            });
        }
        
        if (user !== null) {
            const comparePass = await bcrypt.compare(password, user.pass);
            if (!comparePass ) {
                res.json({
                    message: 'Oop! Pass not match',
                    status: 401
                });
                
            }else{
                let token = jwt.sign(user, 'secretKey', { expiresIn: '24h' });

                res.json({
                    message: `you are logged in ${username}`,
                    data:token
    
                })

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