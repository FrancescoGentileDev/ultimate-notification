const {MongoClient} = require('mongodb');
require('dotenv').config()
const mongoConn = async (req,res,next) => {
    const mongoClient = new MongoClient(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true});
    try {
    await mongoClient.connect();
    } catch(err) {res.send("ERRORE CONNESSIONE AL SERVER")};
    

    console.log('Connessione avvenuta');
    const dbUtenti = mongoClient.db("Utenti");
    const userCollection = dbUtenti.collection('user');
    req.dbUtenti = dbUtenti;
    req.userCollection = userCollection;
    req.mongoClient = mongoClient;
    req.alexaCollection= dbUtenti.collection('alexa')
    next();
}
module.exports = mongoConn;
