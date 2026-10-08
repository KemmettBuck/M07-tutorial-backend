const express = require("express")
var cors = require('cors')
const Song = require("./models/songs")
// const bodyParser = require('body-parser')
const jwt = require('jwt-simple')
const User = require("./models/users")

const app = express()

app.use(cors())
app.use(express.json())

const router = express.Router()
const secret = "supersecret"

//creating a new user
router.post("/user", async(req, res) =>{
    if(!req.body.username || !req.body.password){
        res.status(400).json({error: "Missing username or password"})
    }
    const newUser = await new User({
        username: req.body.username,
        password: req.body.password,
        status: req.body.status
    })
    
    try{
        await newUser.save()
        console.log(newUser)
        res.sendStatus(201) //created
    }
    catch (err){
        res.status(400).send(err)

    }
})

//authenticate
//post request - new 'session'
router.post("/auth", async(req, res) =>{
    if(!req.body.username || !req.body.password){
        return res.status(400).json({error: "Missing username or password"})
    }
    try{
        const user = await User.findOne({username: req.body.username})
            //connection or server error
            if(!user){
                return res.status(401).json({error: "Bad Username"})
            }

            if(user.password != req.body.password){
                return res.status(401).json({error: "Bad Password"})
            }

            //successful login: create token with jwt library
            const token = jwt.encode({username: user.username}, secret)

            res.json({
                username: user.username,
                token: token,
                auth: 1
            })
    }
    catch(err){
        res.status(400).send(err)
    }
})

//check status of user with valid token, see if it matches front end token
router.get("/status", async(req, res) =>{
    if(!req.headers["x-auth"]){
        return res.status(401).json({error: "Missing X-Auth"})
    }
    // if x-auth contains token
    const token = req.headers["x-auth"]
    try{
        const decoded = jwt.decode(token, secret)
        //send back all username status fields to user or frontend
        let users = User.find({}, "username status")
        res.json(users)
    }
    catch(ex){
        res.status(401).json({error: "invalid jwt"})
    }
})

// grab songs in a database
router.get("/songs", async(req, res) =>{
    let query = {}
    if(req.query.genre){
        query = {genre : req.query.genre}
    }

    try {
        // use await instead of function
        const songs = await Song.find(query)
        res.json(songs)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

//grab single song in db
router.get("/songs/:id", async (req, res) =>{
    try{
        const song = await Song.findById(req.params.id)
        res.json(song)
    }
    catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

router.post("/songs", async(req, res) =>{
    try {
        const song = await new Song(req.body)
        await song.save()
        res.status(201).json(song)
        console.log(song)
    }
    catch(err){
        res.status(400).send(err)
    }
})

//update is to update existing record/resource/db entry using a put request
router.put("/songs/:id", async(req, res) =>{
    //first need to find and update song the frontend wants us to update
    //to do this we need to request the id of the song from request
    //and then find it in the db and update it
    try {
        const song = req.body
        await Song.updateOne({_id: req.params.id}, song)
        console.log(song)
        res.sendStatus(204)
    }
    catch(err){
            res.status(400).send(err)
        }
})

router.delete("/songs/:id", async(req, res) =>{
    //method or function in mongoose to delete single instance of object
    try{
    const song = await Song.findById(req.params.id)
    console.log(song)
    await Song.deleteOne({_id: song._id })
    res.sendStatus(204)
    }
    catch(err) {
        res.status(400).send(err)        
    }
})

app.use("/api", router)

var port = process.env.PORT || 3000

app.listen(port)