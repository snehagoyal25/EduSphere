// const express = require("express");

// const app = express();

// app.post("/user/signup",function(req,res){
//     res.json({
//         message : "signup endpoint"
//     })
// })

// app.post("/user/signin",function(req,res){
//     res.json({
//         message : "signin endpoint"
//     })
// })

// // Which courses do user have 
// app.get("/user/purchases",function(req,res){
//     res.json({
//         message : "purchased courses"
//     })
// })

// //Which course do user needs to purchase
// app.post("/course/purchase",function(req,res){
//     res.json({
//         message : ""
//     })
// })

// app.get("/courses",function(req,res){
//     res.json({
//         message : "courses"
//     })
// })

// app.listen(3000);


const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const mongoose = require ("mongoose");
const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRouter);   // any request that is coming to (/user/) endpoint will be handled by this (userRouter) router in user.js
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/admin", adminRouter);

async function main() {
    await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
    console.log("✅ Connected to MongoDB");
    }).catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    });
    app.listen(3000);
    console.log("listening on port 3000")
}

main();