const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Connection failed:", err.message))

module.exports = mongoose