const { botDiscord } = require("./discord");
const { botTelegram } = require("./routeApi");
const { MongoClient } = require("mongodb");
const fetch = require("node-fetch");
const { default: axios } = require("axios");
var moment = require('moment-timezone');
const { MessageEmbed, MessageActionRow, MessageButton} = require("discord.js");
const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"};

//#region CONNESSIONE MONGO
const mongoClient = new MongoClient(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
mongoClient
  .connect()
  .then(() => {
    console.log("connessione permanente avvenuta");
  })
  .catch((err) => console.log(err));
const userCollection = mongoClient.db("Utenti").collection("user");
const liveCollection = mongoClient.db("Utenti").collection("lives");
const dbUtenti = mongoClient.db("Utenti");
//#endregion

const eventTrigger = async (data) => {

  let { type } = data.subscription;
  const broadcaster = parseInt(data.event.broadcaster_user_id);
  console.log(data.event)
  const document = await liveCollection.findOne({ broadcaster: broadcaster }).then(async (usr) => {
    if (!usr&&type==="stream.online") {
      console.log("entrato");
      let insert = {
        broadcaster: parseInt(broadcaster),
        live: false,
        lastGame: "",
        startTime: "",
        endTime: "",
      };
      //  db.user.aggregate([{$lookup: {from: 'post', localField:"id", foreignField: "userId", as: "postati", pipeline:[{$project: {title: 1, _id: 0}}]  }},{$merge: {into: "user",on: "_id"}}])
      let aggiunto = await liveCollection.insertOne(insert).then(async (usr) => {
        let aggregate = await liveCollection
          .aggregate([
            { $match: { broadcaster: broadcaster } },
            {
              $lookup: {
                from: "user",
                localField: "broadcaster",
                foreignField: "data.selectProfile.twitch.id",
                as: "sub",
                pipeline: [
                  { $set: { telegramMessage: "", discordMessage: "" } },
                  {
                    $unset: [
                      "_id",
                      "password",
                      "email",
                      "enabled",
                      "data.twitchId",
                      "data.telegram.uniquecode",
                      "data.telegram.userId",
                      "data.telegram.IdList",
                      "data.discord.idList",
                      "data.discord.userId",
                      
                    ],
                  },
                ],
              },
            },
            { $merge: { into: "lives", on: "_id" } },
          ])
          .forEach((e) => true);

        return await liveCollection.findOne({ broadcaster: broadcaster });
      });
      return aggiunto;
    }
    else if(!usr&&type!=="stream.online") return false
    else if(usr&&type!=="stream.online") return usr;
  });
  if(!document)
    return false
  let streamData = await datistream(document.broadcaster);
  let [{ title, game_name, game_id }] = streamData;

  if (type == "stream.online" && document.live == false) {
    await liveCollection.updateOne({broadcaster: broadcaster}, {$set: {live: true}} )
    await NotificaInizio(document,title, game_name, game_id);
  }
  else if (type == "channel.update" && document.live == true && document.lastGame !== data.event.category_name) {
    await NotificaCambio(document, data.event.category_id, data.event.category_name,title);
  }
  else if (type == "stream.offline" && document.live == true) {
    console.log("ATTENZIONE SONO ENTRATO");
    await liveCollection.updateOne({broadcaster: broadcaster}, {$set: {live: false}} )
    await NotificaFine(document,title, game_name, game_id);
  }
};

async function NotificaInizio(document,title, game_name, game_id) {
  let startTime = (await getdata())
  startTime.getMonth()
  let sendnotQuery= `data.tempvar.sendnot.${startTime.getMonth()}`
  let category = await axios.get(`https://static-cdn.jtvnw.net/ttv-boxart/${game_id}_IGDB-600x800.jpg`).then(async res => {
    if(res.request._redirectable._isRedirect)
    return `https://static-cdn.jtvnw.net/ttv-boxart/${game_id}-600x800.jpg`
    else
    return `https://static-cdn.jtvnw.net/ttv-boxart/${game_id}_IGDB-600x800.jpg`
  })

  console.log(category)
 
  	
  
  liveCollection.updateOne({ broadcaster: document.broadcaster }, { $set: { lastGame: game_name, startTime: startTime } });
  for (elem in document.sub) {
    if (document.sub[elem].data.telegram.checked === true && document.sub[elem].data.telegram.startNot.checked === true&&document.sub[elem].data.selectProfile.telegram) {
      await sendTelegram(document.sub[elem], "startNot", document.broadcaster, category,game_name, title).then((e) => {
        botTelegram.telegram.pinChatMessage(e.idUtenteTelegram, e.messaggio).then(async () => {
          botTelegram.telegram.deleteMessage(e.idUtenteTelegram, e.messaggio + 1).then(async () => {
             liveCollection.updateOne({ broadcaster: document.broadcaster, "sub.username": e.username}, { $set: { "sub.$.telegramMessage": e.messaggio } })
            console.log(e.username)
          }).catch((err) => {console.log("startNot: errore in delete")});;
        }).catch((err) => {console.log("startNot: errore in pin")});
      })
      .catch(err => console.log("startNot: errore in invio"));
    }
    console.log(document.sub[elem].data.discord.checked,document.sub[elem].data.discord.startNot.checked)
    if(document.sub[elem].data.discord.checked===true&&document.sub[elem].data.discord.startNot.checked===true &&document.sub[elem].data.selectProfile.discord){
      console.log("inizio startNot")
     await sendDiscord(document.sub[elem], "startNot", document.broadcaster, category,game_name, title).then((dis) => {
        liveCollection.updateOne({ broadcaster: document.broadcaster, "sub.username": dis.username}, { $set: { "sub.$.discordMessage": dis.id } });
      }).catch((error) => {console.log("errore send discord start: "+ error)})}

      userCollection.updateOne({username: document.sub[elem].username}, {$inc: {[sendnotQuery]: 1} })
    }
}

async function NotificaCambio(document, categoryId, categoryName,title,error) {

  let category = await axios.get(`https://static-cdn.jtvnw.net/ttv-boxart/${categoryId}_IGDB-600x800.jpg`).then(async res => {
    if(res.request._redirectable._isRedirect)
    return `https://static-cdn.jtvnw.net/ttv-boxart/${categoryId}-600x800.jpg`
    else
    return `https://static-cdn.jtvnw.net/ttv-boxart/${categoryId}_IGDB-600x800.jpg`
  })

  console.log(category)


  await liveCollection.updateOne({ broadcaster: document.broadcaster }, { $set: {lastGame: categoryName} });
   for (elem in document.sub) {
    if (document.sub[elem].data.telegram.checked === true && document.sub[elem].data.telegram.midNot.checked === true&&document.sub[elem].data.selectProfile.telegram
      &&!error) {
      let id= document.sub[elem].data.selectProfile.telegram.id
      let lastmess = document.sub[elem].telegramMessage      
      await botTelegram.telegram.unpinChatMessage(id,lastmess).catch((err) => {console.log("midnot: errore unpin"); return true});;
        await  botTelegram.telegram.deleteMessage(id,lastmess) .catch((err) => {console.log("midnot: errore delete previous message"); return true});;
          await  sendTelegram(document.sub[elem], "midNot", document.broadcaster, category, categoryName,title).then(async (e) => {
            await  botTelegram.telegram.pinChatMessage(e.idUtenteTelegram, e.messaggio).then(async () => {
              await botTelegram.telegram.deleteMessage(e.idUtenteTelegram, e.messaggio + 1).then(async () => {
                await  liveCollection.updateOne({ broadcaster: document.broadcaster, "sub.username": e.username}, { $set: { "sub.$.telegramMessage": e.messaggio } });
                console.log("vecchio id: ", lastmess, "nuovo id: ", e.messaggio)
              
           
          }).catch((err) => {console.log("midnot:errore delete message"); return true});;
        }).catch((err) => {console.log("midnot:errore pin message ", err ); return true});;
      }).catch((err) => {console.log("midnot: errore send message"); return NotificaCambio(document, categoryId, categoryName,title,true) });;
    }
    // else if(error)
    // {
    // await sendTelegram(document.sub[elem], "midNot", document.broadcaster, category, categoryName,title).then(async (e) => {
    //   await botTelegram.telegram.pinChatMessage(e.idUtenteTelegram, e.messaggio).then(async () => {
    //     await botTelegram.telegram.deleteMessage(e.idUtenteTelegram, e.messaggio + 1).then(async () => {
    //        await liveCollection.updateOne({ broadcaster: document.broadcaster, "sub.username": e.username}, { $set: { "sub.$.telegramMessage": e.messaggio } });
    //        console.log("vecchio id: ", lastmess, "nuovo id: ", e.messaggio)
    //      }).catch((err) => {console.log("midnot: errore in delete pin"); return true});;
    //    }).catch((err) => {console.log("midnot: errore in pin"); return true});;
    //  })
    // }
    if(document.sub[elem].data.discord.checked===true&&document.sub[elem].data.discord.midNot.checked===true&&document.sub[elem].data.selectProfile.discord){
      let channel= document.sub[elem].data.selectProfile.discord.id
      let lastmess = document.sub[elem].discordMessage
      console.log(channel, lastmess)
      await botDiscord.channels.cache.get(channel).messages.fetch(lastmess).then((message) => message.delete()).catch(err=> {console.log("unable remove previous message")}).then(async() => {
        await sendDiscord(document.sub[elem], "midNot", document.broadcaster, category, categoryName,title).then((dis) => {
          liveCollection.updateOne({ broadcaster: document.broadcaster, "sub.username": dis.username}, { $set: { "sub.$.discordMessage": dis.id } })
        })
      }).catch(err => console.log("errore invio messaggio discord", err))

    }
  }
}

async function NotificaFine(document,title, categoryName, categoryId,error) {
  let endTime = (await getdata())

  let category = await axios.get(`https://static-cdn.jtvnw.net/ttv-boxart/${categoryId}_IGDB-600x800.jpg`).then(async res => {
    if(res.request._redirectable._isRedirect)
    return `https://static-cdn.jtvnw.net/ttv-boxart/${categoryId}-600x800.jpg`
    else
    return `https://static-cdn.jtvnw.net/ttv-boxart/${categoryId}_IGDB-600x800.jpg`
  })

  console.log(category)


  await liveCollection.updateOne({ broadcaster: document.broadcaster }, { $set: {lastGame: categoryName, endTime: endTime} });
   for (elem in document.sub) {
     console.log(document.sub[elem].data.telegram.endNot.checked,error)
    if (document.sub[elem].data.telegram.checked === true && document.sub[elem].data.telegram.endNot.checked === true&& !error&&document.sub[elem].data.selectProfile.telegram) {
      console.log('ENDNOT')
      let id= document.sub[elem].data.selectProfile.telegram.id
      let lastmess = document.sub[elem].telegramMessage      
      await botTelegram.telegram.unpinChatMessage(id,lastmess).catch((err) => {console.log("endNot: errore in delete pin", err); return true});;
        await botTelegram.telegram.deleteMessage(id,lastmess) .catch((err) => {console.log("endNot: errore in pin"); return true});;
          await sendTelegram(document.sub[elem], "endNot", document.broadcaster, category, categoryName,title).then(async(e)=> {
               await botTelegram.telegram.pinChatMessage(e.idUtenteTelegram, e.messaggio).then(async ()=>{
                 await botTelegram.telegram.deleteMessage(e.idUtenteTelegram, e.messaggio + 1).catch((err) => {console.log("endNot; errore in unpin");/* return NotificaCambio(document, categoryId, categoryName,title,true)*/ });;
               }).catch((err) => {console.log("endNot: errore in delete mess " ); return true});;
          }).catch((err) => {console.log("endNot: errore in send",err); return true});;
          
     
    }

    if(document.sub[elem].data.discord.checked===true&&document.sub[elem].data.discord.endNot.checked===true&&document.sub[elem].data.selectProfile.discord){
      let channel= document.sub[elem].data.selectProfile.discord.id
      let lastmess = document.sub[elem].discordMessage
      await botDiscord.channels.cache.get(channel).messages.fetch(lastmess).then((message) => message.delete()).catch(err=> {console.log("unable remove previous message")}).then(async() => {
        await sendDiscord(document.sub[elem], "endNot", document.broadcaster, category, categoryName,title).then((dis) => {
          liveCollection.updateOne({ broadcaster: document.broadcaster, "sub.username": dis.username}, { $set: { "sub.$.discordMessage": dis.id } })
        })
      }).catch(e => { console.log("ERROR END DISCORD: " + e)})

    }
  }
  await liveCollection.deleteOne({ broadcaster: document.broadcaster});
}

async function sendTelegram(document, fase, broadcaster,category, categoryName,title) {
  console.log("BROADCASTER: ", broadcaster)
  let ex= await liveCollection.findOne({ broadcaster: broadcaster }).then(async(doc) => {
    
    if(!doc.startTime){
      console.log("NON STARTTIME")
      doc.startTime = new Date()}
  
      let momentstart = doc.startTime
      let startTemp =await moment.tz(momentstart, document.data.tempvar.timezone)
      let zoneTime =await startTemp.zoneAbbr();
      startTemp=await startTemp.format("YYYY/MM/DD HH:mm")
      let start =await new Date(startTemp).toLocaleString("en-UK", options).concat(" "+ zoneTime)
      console.log(start)
  
  
      let momentend = doc.endTime
      let endTemp =await moment.tz(momentend, document.data.tempvar.timezone)
      let zoneTimeE =await endTemp.zoneAbbr();
      endTemp=await endTemp.format("YYYY/MM/DD HH:mm")
      let end =await new Date(endTemp).toLocaleString("en-UK", options).concat(" "+ zoneTime)
      console.log(end)
  
    return {
      start,
      end
    }
  })
  .then( async (time)=> {
  let params = { ...document.data.telegram[fase] };
  delete params["link"];
  delete params["phrase"];

  let phrase = document.data.telegram[fase].phrase.toString();
  let link = document.data.telegram[fase].link.toString();
  let twitchChan = document.data.selectProfile.twitch.login;
  let idUtenteTelegram = document.data.selectProfile.telegram.id;

  let messaggio;
  console.log(params, phrase, link, twitchChan, idUtenteTelegram);

  let val = {
    image: "",
    title: "",
    game: "",
    time: "",
  };




  for (const elem in params) {
    if (params[elem] && elem !== "checked") {
      if (elem === "image") {

        val.image = category;
      
      }
      else if (elem === "title") val.title = "\n📌: " + title;
      else if (elem === "game") val.game = "\n🎮: " + categoryName;
      else if (elem === "time") {
        val.time = "\n⏳: " + time.start;
        if (fase === "endNot") val.time += "\n⌛: "+ time.end;
      }
    }
  }

  if (params.image) {
    pos = {
      photo: val.image,
      caption: "<b>" + phrase + "\n" + "<i>" + val.title + "</i>" + val.game + val.time + "</b>",
      reply_markup: {
        inline_keyboard: [[{ text: link, url: "https://www.twitch.tv/" + twitchChan }]],
      },
      parse_mode: "HTML",
    };

    await botTelegram.telegram.sendPhoto(idUtenteTelegram, "", pos).then((e) => {
      console.log("SEND");
      messaggio = e.message_id;
    });
  } else {
    let text = "<b>" + phrase + "\n" + "<i>" + val.title + "</i>" + val.game + val.time + "</b>";

    pos = {
      reply_markup: {
        inline_keyboard: [[{ text: link, url: "https://www.twitch.tv/" + twitchChan }]],
      },
      parse_mode: "HTML",
    };
    await botTelegram.telegram
      .sendMessage(idUtenteTelegram, text, pos)
      .then((e) => {
        messaggio = e.message_id;
        console.log("SEND");
      })
      .catch((err) => {
        console.log("sei stronzo", err);
      });
  }
  console.log(messaggio);
  let username = document.username
  return { messaggio, idUtenteTelegram, username};
})
return ex
}

async function sendDiscord(document, fase, broadcaster,category, categoryName,title) {
  console.log("BROADCASTER: ", broadcaster)
  let ex= await liveCollection.findOne({ broadcaster: broadcaster }).then(async (doc) => {

    if(!doc.startTime){
    console.log("NON STARTTIME")
    doc.startTime = new Date()}

    let momentstart = doc.startTime
    let startTemp =await moment.tz(momentstart, document.data.tempvar.timezone)
    let zoneTime =await startTemp.zoneAbbr();
    startTemp=await startTemp.format("YYYY/MM/DD HH:mm")
    let start =await new Date(startTemp).toLocaleString("en-UK", options).concat(" "+ zoneTime)
    console.log(start)


    let momentend = doc.endTime
    let endTemp =await moment.tz(momentend, document.data.tempvar.timezone)
    let zoneTimeE =await endTemp.zoneAbbr();
    endTemp=await endTemp.format("YYYY/MM/DD HH:mm")
    let end =await new Date(endTemp).toLocaleString("en-UK", options).concat(" "+ zoneTime)
    console.log(end)


   return {
      start,
      end
    }
  })
  .then(async (time) => {
  let params = { ...document.data.discord[fase] };
  delete params["link"];
  delete params["phrase"];

  let phrase = document.data.discord[fase].phrase.toString();
  let color = document.data.discord[fase].color;
  let link = document.data.discord[fase].link.toString();
  let twitchChan = document.data.selectProfile.twitch.login;
  let idDiscordChannel = document.data.selectProfile.discord.id;


 let val = {
    image: "",
    title: "",
    game: "",
    time: "",
    timeEnd: "",
  };

  for (const elem in params) {
    if (params[elem] && elem !== "enabled") {
      if (elem === "image")
        val.image = category;
      else if (elem === "title") val.title = title;
      else if (elem === "game") val.game = categoryName;
      else if (elem === "time") {
        val.time = time.start;
        if (fase === "endNot") val.timeEnd = time.end;
      }
    }
  }
  if (link === "") link = "CLICK ME";

  const inizioliveDiscord = new MessageEmbed().setTitle(phrase);

  if (params.title) inizioliveDiscord.setDescription("📣: " + val.title);
  if (params.image) inizioliveDiscord.setImage(val.image);
  if (params.game) inizioliveDiscord.addField("🎮GAME :", val.game);
  if (params.time) {
    if(val.time) {
    inizioliveDiscord.addField("⏳ STARTED:", val.time);
    if (fase === "endNot") inizioliveDiscord.addField("⏳ ENDED:", val.timeEnd);
    }
  }
  inizioliveDiscord
    .setColor(color)
    .setURL(`https://www.twitch.tv/${twitchChan}`);

  let row = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel(link)
      .setURL(`https://www.twitch.tv/${twitchChan}`)
      .setStyle("LINK")
  );

  // botDiscord.users
  //   .createDM(idUtenteDiscord)
  //   .then((user) =>
  //     user.send({ embeds: [inizioliveDiscord], components: [row] })
  //   )
  //   .then(() => res.sendStatus(200))
  //   .catch((e) => res.send("RIATTIVA I MESSAGGI COGLIONE"));


  let discordMessaggio = await botDiscord.channels.cache.get(idDiscordChannel).send({ embeds: [inizioliveDiscord], components: [row] });
  let {id} = discordMessaggio
  console.log('questo è id : ',id)
  let username = document.username
  return {id, idDiscordChannel, username}
})
.catch(e => { console.log("ERRORE SEND DISCORD MESSAGE: " + e)})
  return ex
}

async function datistream(broadcaster) {
  let url = "https://api.twitch.tv/helix/channels?broadcaster_id=" + broadcaster;
  let opts = {
    method: "GET",
    headers: {
      "Client-ID": process.env.CLIENT_ID_TWITCH,
      Authorization: "Bearer " + process.env.TOKEN_TWITCH,
    },
  }; //"txec6m45c09bxhhb36ihk5ei3i2z5f"
  let res = await fetch(url, opts);
  let stream = await res.json();
  return await stream.data;
}

async function getdata() {
  let data= moment.tz("Europe/Rome").toDate()
  return data
  }

module.exports = eventTrigger;
