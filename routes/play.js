const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
    res.render('index');
});

router.post('/play', async (req, res) => {
    try {
        const body = {
            user: req.body.user,
            level: 0
        };
        const game = new Game(body);
        const savedGame = await game.save();
        res.status(201).json(savedGame);
    } catch (err) {
        res.status(400).json({ error: err });
    }
});

router.get('/play', (req, res) => {
    res.render('play');
});

/*
router.get('/questions', async (request, res)=>{
    try{
        const questions = await Question.find();
        res.json(questions);
    }catch(error){
        res.status(400).json({ error: err });
    }
});

router.get('/question/:level', async (req, res) => {
    try {
        const level = parseInt(req.params.level);
        const filters = { level: level};

        const totalRecords = await Question.countDocuments(filters);
        const random = Math.floor(Math.random() * totalRecords);
        let question = await Question.findOne(filters)
            .limit(1)
            .skip(random);

        shuffleProperties(question);

        res.status(200).json(question);
    } catch (err) {
        res.status(400).json({ error: err });
    }
});

router.post('/question', async (req, res)=>{
    try {
        const id = req.body._id;
        const body = {
            question: req.body.question,
            option1: req.body.option1,
            option2: req.body.option2,
            option3: req.body.option3,
            option4: req.body.option4,
            answer: req.body.answer,
            level: req.body.level
        };

        if(id){
            Question.findByIdAndUpdate(id, body, { returnOriginal: false }, function(err, result) {
                if(err) res.status(400).json({ error: err });
                else res.json(result);
            });
        }else{
            const question = new Question(body);
            const savedQuestion = await question.save();
            res.status(201).json(savedQuestion);
        }
    } catch (err) {
        res.status(400).json({ error: err });
    }
});
*/
module.exports = router;
