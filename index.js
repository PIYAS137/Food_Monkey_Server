

const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5022;


// middlewares =====================================
app.use(express.json())
app.use(cors())
require('dotenv').config()
// middlewares =====================================


// ========================== MONGO DB ===========================//


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.frg7rqf.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();



        // collections===========================>>>>
        const userCollections = client.db("FoodMonkeyDB").collection('userCollections');
        const restaurantsCollections = client.db("FoodMonkeyDB").collection('restaurantsCollections');
        const foodsCollections = client.db("FoodMonkeyDB").collection('foodsCollections');
        const cartCollection = client.db("FoodMonkeyDB").collection('cartCollection');
        const purchaseCollection = client.db("FoodMonkeyDB").collection('purchaseCollection');
        // collections===========================>>>>

        // + get Admin status ===================>>>>>
        app.get('/adminstatus/:email', async (req, res) => {
            const email = req.params.email;
            const query = { user_email: email };
            const result = await userCollections.findOne(query);
            if (result?.user_status === 'admin') {
                res.send({ status: 1 }) // admin
            } else {
                res.send({ status: -1 }) // user
            }
        })

        // + create user API ===================>>>>>
        app.post('/user', async (req, res) => {
            const data = req.body;
            const query = { user_email: data?.user_email }
            const isExist = await userCollections.findOne(query);
            if (!isExist) {
                const result = await userCollections.insertOne(data);
                res.send(result);
            }

        })

        // get all users =======================>>>>>
        app.get('/user', async (req, res) => {
            const result = await userCollections.find({}).toArray();
            res.send(result);
        })

        // make user - admin API ===============>>>>>
        app.patch('/user/:sid', async (req, res) => {
            const id = req.params.sid;
            const query = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    user_status: 'admin'
                }
            }
            const result = await userCollections.updateOne(query, updatedDoc)
            res.send(result);
        })

        // + create restaurant API ===========>>>>>
        app.post('/restaurant', async (req, res) => {
            const data = req.body;
            const result = await restaurantsCollections.insertOne(data);
            res.send(result);
        })

        // get all restaurants API ============>>>>>
        app.get('/restaurant', async (req, res) => {
            const result = await restaurantsCollections.find({}).toArray();
            res.send(result);
        })

        // + add food API =====================>>>>>
        app.post('/food', async (req, res) => {
            const data = req.body;
            const result = await foodsCollections.insertOne(data);
            res.send(result);
        })

        // get all foods API ============>>>>>
        app.get('/food', async (req, res) => {
            const result = await foodsCollections.find({}).toArray();
            res.send(result);
        })

        // update one food API ==========>>>>>
        app.patch('/food/:fid', async (req, res) => {
            const data = req.body;
            const id = req.params.fid;
            const query = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    name: data?.name,
                    main_price: data?.main_price,
                    discount_price: data?.discount_price,
                    photo: data?.photo,
                    describe: data?.describe,
                    res_name: data?.res_name
                }
            }
            const result = await foodsCollections.updateOne(query, updatedDoc)
            res.send(result);
        })

        // get one food details =========>>>>>
        app.get('/onefood/:sid', async (req, res) => {
            const id = req.params.sid;
            const query = { _id: new ObjectId(id) };
            const result = await foodsCollections.findOne(query);
            res.send(result);
        })

        // change food status API =============>>>>>
        app.patch('/foodstatus/:sid', async (req, res) => {
            const id = req.params.sid;
            const query = { _id: new ObjectId(id) };
            const item = await foodsCollections.findOne(query); //find the current food status 
            if (item?.status) {
                const updatedDocument = {
                    $set: {
                        status: false
                    }
                }
                const result = await foodsCollections.updateOne(query, updatedDocument);
                res.send(result);
            } else {
                const updatedDocument = {
                    $set: {
                        status: true
                    }
                }
                const result = await foodsCollections.updateOne(query, updatedDocument);
                res.send(result);
            }
        })

        // one food item delete API ==========>>>>>
        app.delete('/food/:sid', async (req, res) => {
            const id = req.params.sid;
            const query = { _id: new ObjectId(id) };
            const result = await foodsCollections.deleteOne(query);
            res.send(result);
        })

        // get one restaurant all foods API ==>>>>>
        app.get('/resfood/:resName', async (req, res) => {
            const name = req.params.resName;
            const query = { res_name: name };
            const result = await foodsCollections.find(query).toArray();
            res.send(result);
        })

        // get area wise restaurns API ======>>>>>>
        app.get('/resfoods/:resArea', async (req, res) => {
            const name = req.params.resArea;
            const query = { res_city: name };
            const result = await restaurantsCollections.find(query).toArray();
            res.send(result);
        })

        // place a item in cart API ========>>>>>
        app.post('/cart', async (req, res) => {
            const data = req.body;
            const query = { foodId: data?.foodId, orderUserEmail: data?.orderUserEmail };
            const isExist = await cartCollection.findOne(query);
            if (isExist) {
                res.send({ flag: -1 }) // alreay exist !
            } else {
                const result = await cartCollection.insertOne(data);
                res.send(result);
            }
        })

        // + get an user all cart item API =======>>>>>
        app.get('/cart/:email', async (req, res) => {
            const email = req.params.email;
            const query = { orderUserEmail: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        })

        // + get all cart data API ==============>>>>>>
        app.get('/carts', async (req, res) => {
            const result = await cartCollection.find({}).toArray();
            res.send(result);
        })

        // place order API =================>>>>>
        app.post('/purchase', async (req, res) => {
            const data = req.body;
            const query = { orderUserEmail: data?.user_email }
            const result = await purchaseCollection.insertOne(data);
            if (result.insertedId) {
                // delete all items from cart by user email
                const tempResult = await cartCollection.deleteMany(query);
            }
            res.send(result);
        })

        // + get an user all purchase datas ======>>>>
        app.get('/purchase', async (req, res) => {
            const email = req.query.email;
            const query = { user_email: email };
            const result = await purchaseCollection.find(query).toArray();
            res.send(result);
        })

        // + get all user all purchase datas ======>>>>
        app.get('/purchases', async (req, res) => {
            const result = await purchaseCollection.find({}).toArray();
            res.send(result);
        })











        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


// ========================== MONGO DB ===========================//





app.get('/', (req, res) => {
    res.send("Server is runngin ............!!!")
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})