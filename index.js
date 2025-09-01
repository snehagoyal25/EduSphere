const express = require("express");

const app = express();

app.post("/user/signup",function(req,res){
    res.json({
        message : "signup endpoint"
    })
})

app.post("/user/signin",function(req,res){
    res.json({
        message : "signin endpoint"
    })
})

// Which courses do user have 
app.get("/user/purchases",function(req,res){
    res.json({
        message : "purchased courses"
    })
})

//Which course do user needs to purchase
app.post("/course/purchase",function(req,res){
    res.json({
        message : ""
    })
})

app.get("/courses",function(req,res){
    res.json({
        message : "courses"
    })
})

app.listen(3000);