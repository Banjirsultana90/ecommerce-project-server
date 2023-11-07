const express=require("express")
const cors=require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app =express()


app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${ process.env.DB_PASS}@cluster0.id4vsgi.mongodb.net/?retryWrites=true&w=majority`;

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
    const alljobs=client.db('jobDB').collection('categories')
    const addedjobs=client.db('jobDB').collection('addedjobs')

    app.get('/categories',async(req,res)=>{
        const result=await alljobs.find().toArray()
        res.send(result)
    })
 app.post('/categories',async(req,res)=>{
    const newjob=req.body
    console.log(newjob);
    const result=await addedjobs.insertOne(newjob)
    res.send(result)
})

app.get('/addedjobs',async(req,res)=>{
    const result=await addedjobs.find().toArray()
    res.send(result)
})
app.delete('/addedjobs/:id',async(req,res)=>{
    const id =req.params.id
    const query={
        _id:new ObjectId(id)
    }
    const result=await addedjobs.deleteOne(query)
    res.send(result)})


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


const port =process.env.PORT||5000

app.get('/',(req,res)=>{
    res.send('Crud is running')
})

app.listen(port,()=>{
    console.log(`port is running on${port}`)
})
