const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

function shuffleProperties(pregunta){
    const keys = ['option1','option2','option3','option4'];
    const keysShuffle = structuredClone(keys).sort((a, b) => 0.5 - Math.random());
    const clone = structuredClone(pregunta);
    //pregunta.answer = 1;

    for (var key in keys){
        let index = keys[key];
        let indexShuffle = keysShuffle[key];
        pregunta[index] = clone[indexShuffle];
        if(indexShuffle == ('option'+clone.answer)) pregunta.answer = parseInt(key)+1;
    }
}

function getUrlDriveLink(drive_link){
    if(!drive_link) return null;
    const idDrive = drive_link.split('/')[5];
    return `http://drive.google.com/uc?export=view&id=${idDrive}`;
}

function getImageByLink(enlace){
    if(!enlace) return '';
    return `<br><img class="question-img" src="${enlace}">`;
}

function getDataCsv(urlCSV, callback){
    let stream = fs.createReadStream(urlCSV);
    let collectionCsv = [];

    let csvFileStream = csv.parse().on('data', function(data){
        collectionCsv.push(data)
    }).on('end', function(){
        collectionCsv.shift();
        //fs.unlinkSync(csvUrl);
        callback(collectionCsv);
    });
    stream.pipe(csvFileStream);
}

router.get('/question', (req, res) => {
    res.render('addquestion');
});

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

router.post('/question-remove/:id', async (req, res)=>{
    try {
        const id = req.params.id;
        Question.remove({ _id: id }, function(err) {
            if (err) res.status(400).json({ error: err });
            else res.json({message: 'ok'});
        });
    } catch (err) {
        res.status(400).json({ error: err });
    }
});

router.get('/csv-question', async (req, res) =>{
    const urlCSV = path.join(__dirname, '..', 'public', 'uploads', 'preguntas.csv');
    getDataCsv(urlCSV, (data)=>{
        const collectionCsv = data.map((question) => {
            return {
                question: question[0] + getImageByLink(getUrlDriveLink(question[7])),
                option1: question[1],
                option2: question[2],
                option3: question[3],
                option4: question[4],
                answer: 1,
                level: question[5].split(',').map((x) => parseInt(x)),
                time: (question[6] * 60)
            }
        });

        Question.insertMany(collectionCsv).then(function(){
            res.json(collectionCsv);
        }).catch(function(error){
            res.status(400).json({ error: error });
        });
    });

    /*let csvFileStream = csv
        .parse()
        .on('data', function (data) {
            collectionCsv.push(data)
        })
        .on('end', function () {
            collectionCsv.shift()
            db.connect((error) => {
                if (error) {
                    console.error(error)
                } else {
                    let query = 'INSERT INTO users (id, name, email) VALUES ?'
                    db.query(query, [collectionCsv], (error, res) => {
                        console.log(error || res)
                    })
                }
            })
            fs.unlinkSync(csvUrl)
        })
    stream.pipe(csvFileStream)*/
    
});

/*
router.get('/lifelines/audiencepoll/:questionId', async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);
        if (question.slot <= 40000)
            options = audiencePoll(question.answer - 1, 50);
        else if (question.slot <= 320000)
            options = audiencePoll(question.answer - 1, 30);
        else options = audiencePoll(question.answer - 1, 10);
        const data = {
            option1: options[0],
            option2: options[1],
            option3: options[2],
            option4: options[3]
        };
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err });
    }
});

router.get(
    '/lifelines/50-50-to-audiencepoll/:questionId/:removedOption1/:removedOption2',
    async (req, res) => {
        try {
            const question = await Question.findById(req.params.questionId);
            const removedOption1 = req.params.removedOption1 - 1;
            const removedOption2 = req.params.removedOption2 - 1;

            if (question.slot <= 40000)
                options = fiftyFiftyToAudiencePoll(
                    question.answer - 1,
                    removedOption1,
                    removedOption2,
                    50
                );
            else if (question.slot <= 320000)
                options = fiftyFiftyToAudiencePoll(
                    question.answer - 1,
                    removedOption1,
                    removedOption2,
                    30
                );
            else
                options = fiftyFiftyToAudiencePoll(
                    question.answer - 1,
                    removedOption1,
                    removedOption2,
                    10
                );
            const data = {
                option1: options[0],
                option2: options[1],
                option3: options[2],
                option4: options[3]
            };
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: err });
        }
    }
);

function audiencePoll(answer, value) {
    let options = [0, 0, 0, 0];
    options[answer] = Math.floor(Math.random() * 50) + value;
    let total = options[answer];
    for (let i = 0; i < 3; i++) {
        let zeroAt = options.indexOf(0);
        if (i == 2) options[zeroAt] = 100 - total;
        else {
            options[zeroAt] = Math.floor(Math.random() * (100 - total));
            total += options[zeroAt];
        }
    }
    return options;
}

function fiftyFiftyToAudiencePoll(answer, removed1, removed2, value) {
    let options = [0, 0, 0, 0];
    options[answer] = Math.floor(Math.random() * 50) + value;
    for (let i = 0; i < 4; i++) {
        if (i != removed1 && i != removed2 && options[i] == 0) {
            options[i] = 100 - options[answer];
            break;
        }
    }
    return options;
}

router.get('/lifelines/fiftyfifty/:questionId', async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);
        let randomOption1 = Math.floor(Math.random() * 4) + 1;
        while (randomOption1 == question.answer)
            randomOption1 = Math.floor(Math.random() * 4) + 1;
        let randomOption2 = Math.floor(Math.random() * 4) + 1;
        while (
            randomOption2 == question.answer ||
            randomOption2 == randomOption1
        )
            randomOption2 = Math.floor(Math.random() * 4) + 1;
        res.status(200).json({
            remove1: randomOption1,
            remove2: randomOption2
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err });
    }
});

router.get('/lifelines/flipthequestion/:questionId/:slot', async (req, res) => {
    try {
        const count = await Question.countDocuments({
            slot: req.params.slot
        });
        const random = Math.floor(Math.random() * (count - 1));
        const question = await Question.find({
            _id: { $not: { $in: req.params.questionId } },
            slot: req.params.slot
        })
            .limit(1)
            .skip(random);
        res.status(200).json(question);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err });
    }
});

router.get('/lifelines/asktheexpert/:questionId', async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);
        const random = Math.floor(Math.random() * 100);
        if (random > 20) {
            // Return correct answer
            res.status(200).json({ answer: question.answer });
        } else {
            // Return any random answer -> Maybe correct or incorrect
            const randomAnswer = Math.floor(Math.random() * 4) + 1;
            res.status(200).json({ answer: randomAnswer });
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err });
    }
});

router.get(
    '/lifelines/50-50-to-asktheexpert/:questionId/:removedOption1/:removedOption2',
    async (req, res) => {
        try {
            const question = await Question.findById(req.params.questionId);
            console.log(question);
            const removedOption1 = req.params.removedOption1;
            const removedOption2 = req.params.removedOption2;

            // An array to store remaining Options
            let remainingOptionsArray = [1, 2, 3, 4];
            remainingOptionsArray = remainingOptionsArray.filter(
                item => item != removedOption1 && item != removedOption2
            );

            const random = Math.floor(Math.random() * 100);
            if (random > 10) {
                // Return correct answer
                res.status(200).json({ answer: question.answer });
            } else {
                // Return any random answer -> Maybe correct or incorrect
                const randomAnswer = Math.floor(Math.random() * 2);

                res.status(200).json({
                    answer: remainingOptionsArray[randomAnswer]
                });
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: err });
        }
    }
);
*/
module.exports = router;
