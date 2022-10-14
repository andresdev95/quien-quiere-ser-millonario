const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

const Questions = [
    {
        _id: 1,
        question: '¿Cual es una comida?',
        option1: 'queso',
        option2: 'cobre',
        option3: 'oro',
        option4: 'plata',
        answer: 1,
        level: 1
    },
    {
        _id: 2,
        question: '¿Que medalla indica el primer lugar?',
        option1: 'Bronce',
        option2: 'Cobre',
        option3: 'Oro',
        option4: 'Plata',
        answer: 3,
        level: 1
    }
];

function shuffleProperties(pregunta){
    const keys = ['option1','option2','option3','option4'];
    const keysShuffle = structuredClone(keys).sort((a, b) => 0.5 - Math.random());
    const clone = structuredClone(pregunta);
    pregunta.answer = 1;

    for (var key in keys){
        let index = keys[key];
        let indexShuffle = keysShuffle[key];
        pregunta[index] = clone[indexShuffle];
        if(indexShuffle == 'option1') pregunta.answer = parseInt(key)+1;
    }
}

router.get('/question', (req, res) => {
    res.render('addquestion');
});


router.get('/save-question', async (req, res) => {
    let results = [];
    for (var i = 0; i < Questions.length; i++) {
        const a = Questions[i];
        const question = new Question({
            question: a.question,
            option1: a.option1,
            option2: a.option2,
            option3: a.option3,
            option4: a.option4,
            answer: a.answer,
            level: a.level
        });

        const result = await question.save();
        results.push(result);
    }
    res.json(results);
});


router.get('/questions', async (request, res)=>{
    const questions = await Question.find();
    try{
        res.json(questions);
    }catch(error){
        res.status(400).json({ error: err });
    }
});


/*
router.get('/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        Question.res.json(questions);
    } catch (err) {
        res.json({ message: err });
    }
});
*/

/*router.get('/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        Question.res.json(questions);
    } catch (err) {
        res.json({ message: err });
    }
});*/

router.get('/question/:level', async (req, res) => {
    //await Question.updateMany({},{ $set: { level: [1] } });

    try {
        const level = parseInt(req.params.level);
        const filters = { level: level};

        const totalRecords = await Question.countDocuments(filters);
        const random = Math.floor(Math.random() * totalRecords);
        let question = await Question.findOne(filters)
            .limit(1)
            .skip(random);


        //shuffleProperties(question);

        res.status(200).json(question);
    } catch (err) {
        res.status(400).json({ error: err });
    }
});

router.post('/question', async(req, res)=>{
    try {
        const question = new Question({
            question: req.body.question,
            option1: req.body.option1,
            option2: req.body.option2,
            option3: req.body.option3,
            option4: req.body.option4,
            answer: req.body.answer,
            level: req.body.level
        });

        const savedQuestion = await question.save();
        res.status(201).json(savedQuestion);
    } catch (err) {
        res.status(400).json({ error: err });
    }
});

// Get A Specific Question
router.get('/check/:questionId', async (req, res) => {
    try {
        //const question = await Question.findById(req.params.questionId);
        const question = getQuestionById(req.params.questionId);
        res.status(200).json({ answer: question.answer });
    } catch (err) {
        res.status(400).json({ error: err });
    }
});

router.get('/checkanswer/:questionId', async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);
        res.status(200).json({ answer: question.answer });
    } catch (err) {
        res.status(400).json({ error: err });
    }
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
