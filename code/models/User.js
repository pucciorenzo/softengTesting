import mongoose from 'mongoose'

export const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        max: 255
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true,
});

export default mongoose.model('User', UserSchema);   