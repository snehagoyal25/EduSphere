const { Router } = require("express");
const{ z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { adminModel, courseModel } = require("../db");

const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middleware/admin");

const adminRouter = Router();

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
});

const signinSchema = z.object({
    email:z.string().email(),
    password: z.string().min(6)
});


adminRouter.post("/signup", async function(req, res) {
    try {
        //validate input
        const parsedData = signupSchema.parse(req.body);
        const { email, password, firstName, lastName } = parsedData;
        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        //create admin in db
        await adminModel.create({
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
})

adminRouter.post("/signin", async function(req, res) {
   try {
        const parsedData = signinSchema.parse(req.body);
        const { email, password } = parsedData;

        const admin = await adminModel.findOne({email});//findOne provides either the admin or undefined (if pass value then only it's true)
        if (!admin) { //but find provide all admins with same adminname or an empty array (always true)
            return res.status(403).json ({
               message: "Incorrect credentials!"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if(!isPasswordCorrect) {
            return res.status(403).json ({
               message: "Incorrect credentials!"
            })
        }
        const token  = jwt.sign({
                id: admin._id
            }, JWT_ADMIN_PASSWORD, { expiresIn: "1h" });
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
        return res.status(500).json({ message: "Something went wrong!" });
    }
})

adminRouter.post("/course", adminMiddleware, async function(req, res) {
    const adminId = req.userId;

    const { title, description, imageUrl, price } = req.body;

    const course = await courseModel.create({
        title,
        description, 
        imageUrl,
        price, 
        creatorId: adminId
    })

    res.json({
        message: "Course created!",
        courseId: course._id
        
    })
})

adminRouter.put("/course", adminMiddleware, async function(req, res) {
    const adminId = req.userId;

    const { title, description, imageUrl, price, courseId } = req.body;

    const course = await courseModel.updateOne({
        _id: courseId,
        creatorId: adminId
    },{
        title,
        description, 
        imageUrl,
        price, 
    })

    res.json({
        message: "Course updated!",
        courseId: course._id
    })
})

adminRouter.get("/course/bulk", adminMiddleware, async function(req, res) {
    const adminId = res.userId;

    const courses = await courseModel.find({
        creatorId: adminId
    })

    res.json({
        message: "show all course content!",
        courses
    })
})

module.exports = {
    adminRouter: adminRouter
}