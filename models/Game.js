const mongoose = require('mongoose');

const GameSchema = mongoose.Schema(
    {
        user: { type: String, required: true, trim: true },
        level: { type: Number, required: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' 
    }
});

module.exports = mongoose.model('Games', GameSchema);
