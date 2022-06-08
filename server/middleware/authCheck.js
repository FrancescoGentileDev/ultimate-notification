require("dotenv").config()


const authCheck = (req,res,next) =>{
  try{
   let ref = req.headers.referer.slice(0,process.env.SITE.length)
   console.log(req.headers.seche)
    if(req.headers.seche===process.env.SECHE && ref === process.env.SITE){
      console.log("AUTHCHECK 202")
      return next();
      }
    else
      return res.sendStatus(401)
    }
    catch(e){
      return res.sendStatus(401)
    }
}

module.exports = authCheck