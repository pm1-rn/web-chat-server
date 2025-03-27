import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';


export async function signUp(req, res) {
    const { fullName, email, password } = req.body;
    try {
        // 1
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required '});
        }
        // 2
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 chars '});
        }
        // 3
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email already exists '});
        }
        // 4
        const salt = await bcrypt.getSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // 5
        const newUser = new User({
            fullName, email, password: hashedPassword
        }); 
        // 6
        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

           // 7
           res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName, 
            email: newUser.email,
            profilePic: newUser.profilePic
           });
        } else {
            return res.status(400).json({ message: 'Invalid user data '});
        }
    } catch (error) {
        console.log('Error in signUp: ', error.message);
        return res.status(500).json({ message: 'Internal server error in signUp '});

    }

    }





export async function signIn(req, res) {
    const { email, password } = req.body;
    try {
        // 1
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // 2
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'User not found' });
        }

        // 3
        generateToken(user._id, res);
        res.status(200).json({
            _id: newUser._id,
            fullName: newUser.fullName, 
            email: newUser.email,
            profilePic: newUser.profilePic
        
        });
    } catch(error) {
        console.log('Error in signIn: ', error.message);
        res.status(500).json({ message: 'Internal server error in signIn '});
    }
}



export async function signOut (req, res) {
    try {
        res.cookie('jwt', "", { maxAge: 0});
        res.status(200).json({ message: 'SignOut successfully '});
    } catch(error){
        console.log('Error in signOut: ', error.message);
         res.status(500).json({ message: 'Internal server error in signOut '});
    }
    }

export async function updateProfile(req, res){
    try {
        // 1
        const { profilePic } = req.body;
        const userId = req.user._id;

        // 2
        if (!profilePic) {
            return res.status(500).json({ message: 'Profile Picture is required'});
        }
        // 3
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic: uploadResponse.secure_url
        }, {
            new: true
        });
        // 4
        return res.status(200).json(updatedUser);

    } catch (error){
        console.log('Error in updateProfile: ', error.message);
        return res.status(500).json({ message: 'Internal server error in updateProfile '});
    }
}
export async function checkAuth(req, res){
        try {
            return res.status(200).json(req.user);
        } catch (error) {
            console.log('Error in updateProfile: ', error.message);
            return res.status(500).json({ message: 'Internal server error in checkOut '});
         }
        }