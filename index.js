const express = require("express")
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
app.use(cookieParser())
app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true
}))

app.use(express.json())

const logger = async (req, res, next) => {
    console.log('called', req.method, req.originalUrl);
    next()
}

const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token
    console.log('value of token', token)
    if (!token) {
        return res.status(401).send({ message: 'forbidden' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized' })
        }
        req.user = decoded

        next()
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.id4vsgi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const alljobs = client.db('jobDB').collection('categories')
        const bidedjobs = client.db('jobDB').collection('bidedjobs')
        const addedjobs = client.db('jobDB').collection('addedjobs')



        // auth api
        app.post('/jwt', async (req, res) => {
            const user = req.body
            console.log('user for token', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .send({ success: true })
        })

        app.post('/logout', async (req, res) => {
            const user = req.body
            console.log('loging out', user);
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })

        })


        app.get('/bidedjobs', async (req, res) => {
            const result = await bidedjobs.find().toArray()
            res.send(result)
        })

        app.get('/categories', async (req, res) => {
            const result = await alljobs.find().toArray()
            res.send(result)
        })

        app.post('/addedjobs', async (req, res) => {
            const newjob = req.body
            console.log(newjob);
            const result = await addedjobs.insertOne(newjob)
            res.send(result)
        })

        app.post('/bidedjobs', async (req, res) => {
            const formdata = req.body
            console.log(formdata);
            const result = await bidedjobs.insertOne(formdata)
            res.send(result)
        })

        app.get('/addedjobs', async (req, res) => {

            const result = await addedjobs.find().toArray()
            res.send(result)
        })
        app.delete('/addedjobs/:id', async (req, res) => {

            const id = req.params.id
            const query = {
                _id: new ObjectId(id)
            }
            const result = await addedjobs.deleteOne(query)
            res.send(result)
        })

        // app.get('/addedjobs/:id', async (req, res) => {
        //     console.log(req.query.email)
        //     // console.log('token owner info', req.user)
        //     // if(req.user.email!==req.query.email){
        //     //     return res.status(403).send({message:'forbidden access'})
        //     // }
        //     const id = req.params.id
        //     const query = {
        //         _id: new ObjectId(id)
        //     }
        //     const result = await addedjobs.findOne(query)
        //     res.send(result)
        // })
        app.get('/addedjobs/:id', async (req, res) => {
            console.log(req.query.email);
            // console.log('token owner info', req.user);
            // if (req.user.email !== req.query.email) {
            //     return res.status(403).send({ message: 'forbidden access' });
            // }
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await addedjobs.findOne(query);
            res.send(result);
        });


        app.put('/addedjobs/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const updatedjob = req.body;

            const job = {
                $set: {
                    jobTitle: updatedjob.jobTitle,
                    deadline: updatedjob.deadline,
                    shortDescription: updatedjob.shortDescription,
                    email: updatedjob.email,
                    category: updatedjob.category,
                    minimumprice: updatedjob.minimumprice,
                    maximumprice: updatedjob.maximumprice,
                },
            };

            const result = await addedjobs
                .updateOne(filter, job, options);
            res.send(result);
        });


        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


const port = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('Crud is running')
})

app.listen(port, () => {
    console.log(`port is running on${port}`)
})
