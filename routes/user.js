const { Router } = require("express");
const{ z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel, purchaseModel, courseModel } = require("../db");
const { userMiddleware } = require("../middleware/user");
const { JWT_USER_PASSWORD } = require("../config");

const userRouter = Router(); //function

//zod schema for signup
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
});

//zod schema for signin
const signinSchema = z.object({
    email:z.string().email(),
    password: z.string().min(6)
});

userRouter.post("/signup", async function(req, res) {
    try {
        //validate input
        const parsedData = signupSchema.parse(req.body);
        const { email, password, firstName, lastName } = parsedData;
        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        //create user in db
        await userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });
        res.json({
            message: "signup succeeded!"
        })
    } catch(e) {
        if (e.name === "ZodError") {
            return res.status(400).json({
                error: e.errors
            });
        }
        console.error("Signup error:", e);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
});

userRouter.post("/signin", async function(req, res) {
    try {
        const parsedData = signinSchema.parse(req.body);
        const { email, password } = parsedData;

        const user = await userModel.findOne({email});//findOne provides either the user or undefined (if pass value then only it's true)
        if (!user) { //but find provide all users with same username or an empty array (always true)
            res.status(403).json ({
               message: "Incorrect credentials!"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(403).json ({
               message: "Incorrect credentials!"
            })
        }
        const token  = jwt.sign({
                id: user._id
            }, JWT_USER_PASSWORD, { expiresIn: "1h" });
            res.json({
            token
        })
        
        // Set token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // set to true if using HTTPS
            maxAge: 3600000 // 1 hour
        });

        res.json({ message: "Signin successful!" });
    } catch (e) {
        if (e.name === "ZodError") {
        return res.status(400).json({ error: e.errors });
        }
        console.error("Signin error:", e);
        res.status(500).json({ message: "Something went wrong!" });
    }
})

userRouter.get("/purchases", userMiddleware, async function(req, res) {
    const userId = req.userId;

    const purchases = await purchaseModel.find({
        userId
    });

    const courseData = await courseModel.find({
        _id: { $in: purchases.map(x => x.courseId)}
    })

    res.json({
        purchases,
        courseData
    })
})

module.exports = {
    userRouter: userRouter
}