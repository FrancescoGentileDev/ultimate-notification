

const prova = async (req,res,next) => {
   let utente = await req.userCollection.findOne({username: req.body.username},(err, user) => {
        if(err) 
            res.send("errore connessione database");
        if(!user)
            res.send("utente non trovato");
            else
                res.send("utente trovato: "+ user.username+ " password: "+ user.password);
   })

}


module.exports = prova;