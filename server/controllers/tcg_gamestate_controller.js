const express = require('express');
const router = express.Router();
const crypto=require('crypto')
const gameState=require("../models/gamestates.js")
const DeckV2 = require('../models/deckv2.js');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));

module.exports.newGamestate = (req,res,err)=>{
    DeckV2.findOne({$and:[{_id:req.body.deckselection},{userID:req.user.id}]})
    .populate('cards.card').exec((err,deck)=>{
        var UUID = crypto.randomBytes(64).toString('hex');
        const newGamestate = new gameState({
            gameStateUUID: UUID,
            gameStateName: req.body.gamename,
            format: req.body.formatselection,
            playerOneUUID: "",
            playerOneName: "",
            playerOneDeckName: "",
            playerOneDeck: {},
            playerOneDiscard: {},
            playerOnePrizes: {},
            playerOneHand: {},
            playerOneStage: {},

            playerTwoUUID: "",
            playerTwoName: "",
            playerTwoDeckName: "",
            playerTwoDeck: {},
            playerTwoDiscard: {},
            playerTwoPrizes: {},
            playerTwoHand: {},
            playerTwoStage: {},
            coinFlip:"",
            activeTime:Date.now()
        });
        gameState.create(newGamestate)
        let cards=[]
        for (let card of deck.cards){
            cards.push({imageUrl:card.card.imageUrl,id:card.card.id,instances:card.instances})
        }
        res.render("tcg_game_play",{Deck:cards,gameUUID:UUID,player:"player1",playerName:req.body.playerName,deckName:deck.deckName});
    })
    .catch((err)=>{
        console.log(err)
    })
 }

module.exports.joinGame = (req,res,next)=>{
    DeckV2.findOne({$and:[{_id:req.body.deckselection},{userID:req.user.id}]})
    .populate('cards.card').exec((err,deck)=>{
        let cards=[]
        for (let card of deck.cards){
            cards.push({imageUrl:card.card.imageUrl,id:card.card.id,instances:card.instances})
        }
        res.render("tcg_game_play",{Deck:cards,gameUUID:req.body.gameselection,player:"player2",playerName:req.body.playerName,deckName:deck.deckName});
    })
    .catch((err)=>{
        console.log(err)
    })
}

module.exports.queryAllExisting=(req,res,next)=>{
    gameState.find()
    .then(foundGames=>{
        let foundGameStateUuidArr=[];
        foundGames.forEach(game=>{
            foundGameStateUuidArr.push({gameStateUUID:game.gameStateUUID,gameStateName:game.gameStateName,playerOneName:game.playerOneName,playerOneDeckName:game.playerOneDeckName,format:game.format})
        })
        return res.json(foundGameStateUuidArr)
    })
}
module.exports.updateGamestate =(req,res,next)=>{
    if (req.body.player=="player1")
        gameState.findOneAndUpdate({gameStateUUID:req.body.gameUUID},
            {playerOneHand:req.body.hand,playerOneDeck:req.body.deck,playerOneDiscard:req.body.discard,playerOnePrizes:req.body.prizes,playerOneUUID:req.body.playerUUID,playerOneStage:req.body.stageData,playerOneName:req.body.playerName,playerOneDeckName:req.body.deckName,activeTime:Date.now()}, 
            function(err,doc){
            if (err) return res.send(500, {error:err});
        })
    if (req.body.player=="player2")
        gameState.findOneAndUpdate({gameStateUUID:req.body.gameUUID},
            {playerTwoHand:req.body.hand,playerTwoDeck:req.body.deck,playerTwoDiscard:req.body.discard,playerTwoPrizes:req.body.prizes,playerTwoUUID:req.body.playerUUID,playerTwoStage:req.body.stageData,playerTwoName:req.body.playerName,playerTwoDeckName:req.body.deckName,activeTime:Date.now()}, 
            function(err,doc){
            if (err) return res.send(500, {error:err});
        })
    return res.json("success")
}

module.exports.getGameState = (req,res,next)=>{
    var gameStateUUID=Object.values(req.query)[0]
    gameState.find({gameStateUUID:gameStateUUID})
    .then(foundGame=>{
        return res.json(foundGame[0]);
    })
}
module.exports.updateCoinFlip =(req,res,next)=>{
        gameState.findOneAndUpdate({gameStateUUID:req.body.gameUUID},
            {coinFlip:req.body.flipResult}, 
            function(err,doc){
            if (err) return res.send(500, {error:err});
        })
    return res.json("success")
}
module.exports.getCoinFlip =(req,res,next)=>{
    gameState.findOne({gameStateUUID:Object.values(req.query)[0]})
    .then(flip=>{
        return res.json(flip.coinFlip)
    })
}
