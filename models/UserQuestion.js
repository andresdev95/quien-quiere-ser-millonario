const mongoose = require('mongoose');

const UserQuestionSchema = mongoose.Schema({
    question: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    level: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('UserQuestions', UserQuestionSchema);
