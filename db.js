const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema ({
    email: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String
});

const adminSchema = new Schema ({
    email: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String
});

const courseSchema = new Schema ({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: { type: ObjectId, ref: "admin" }
});

const purchaseSchema = new Schema ({
    userId: { type: ObjectId, ref: "user" },
    courseId: { type: ObjectId, ref: "course" }
});

async function fetchPurchase() {
  await mongoose.connect("mongodb+srv://nehagoyal5557:snehagoyal@cluster0.wefzx.mongodb.net/coursera-app")
  const purchases = await purchaseModel
  .find()
  .populate('userId')
  .populate('courseId');

  console.log(purchases);
}

const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);

module.exports = {
  userModel,
  adminModel,
  courseModel,
  purchaseModel
};