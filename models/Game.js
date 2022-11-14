const mongoose = require('mongoose');

const GameSchema = mongoose.Schema(
    {
        usuario: { type: String, required: true, trim: true },
        nivel_actual: { type: Number, required: true },
        nivel_maximo: { type: Number, required: true },
        tiempo: { type: Number, required: true },
        finalizado: { type: Number, required: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' 
    }
});

module.exports = mongoose.model('Games', GameSchema);
