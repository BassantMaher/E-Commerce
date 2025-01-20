import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required!"],
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Invalid email format']
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
        minlength: [8, "Password must be at least 8 characters long!"],
        select: true
    },
    cartItems:[
        {
            quantity:{
                type: Number,
                default: 0
            },
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ],
    role:{
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    }
}, {
    timestamps: true,
});

 //(pre-save hook): hash the user password before we save our user --> run this function
 userSchema.pre('save', async function(next) {
    // only hash the password if it has been modified (hasent been changed)
    if (!this.isModified('password')) return next();
    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next(); // to call the next middleware
    }catch(error){
        next(error);
    }
});

// to check for the password of the current user, to check credentials

userSchema.methods.comparePassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;