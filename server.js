const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const Food = require("./models/Food");
const User = require("./models/User");
const Order = require("./models/Order");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// MongoDB connect
mongoose
  .connect("mongodb://127.0.0.1:27017/food_project")
  .then(() => console.log("MongoDB connected "))
  .catch((err) => console.log("MongoDB error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Working ");
});

// Sample food add route
app.get("/create-sample-food", async (req, res) => {
  try {
    const item = new Food({
      name: "Margherita Pizza",
      price: 199,
      description: "Extra Cheese",
    });

    await item.save();
    res.send("Item Saved");
  } catch (err) {
    console.log(err);
    res.send("Error");
  }
});

// All foods list
app.get("/foods", async (req, res) => {
  try {
    const allFood = await Food.find();
    res.json(allFood);
  } catch (err) {
    console.log(err);
    res.send("Error aaya food list laate time");
  }
});

// USER REGISTER API
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new User({
      name,
      email,
      password,
      address,
      phone,
    });

    await user.save();

    res.json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error registering user" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();

    // food name add 
    const finalData = [];
    for (let o of orders) {
      const food = await Food.findById(o.foodItemId);

      finalData.push({
        _id: o._id,
        userId: o.userId,
        foodName: food ? food.name : "Unknown Food",
        quantity: o.quantity,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      });
    }

    res.json(finalData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error loading orders" });
  }
});

// DELETE / CANCEL ORDER
app.delete("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting order" });
  }
});

app.get("/orders/user/:id", async (req, res) => {
    const orders = await Order.find({ userId: req.params.id });

    const final = [];
    for (let o of orders) {
        const food = await Food.findById(o.foodItemId);

        final.push({
            ...o._doc,
            foodName: food ? food.name : "Unknown Item"
        });
    }

    res.json(final);
});

// ADD FOOD ITEM (ADMIN)
app.post("/add-food", async (req, res) => {
  try {
    const { name, price, description } = req.body;

    const food = new Food({
      name,
      price,
      description,
    });

    await food.save();

    res.json({ message: "Food added successfully", food });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding food" });
  }
});

// UPDATE FOOD ITEM
app.put("/foods/:id", async (req, res) => {
  try {
    const foodId = req.params.id;
    const updated = await Food.findByIdAndUpdate(foodId, req.body, { new: true });
    res.json({ message: "Food updated", updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating food" });
  }
});

// DELETE FOOD ITEM
app.delete("/foods/:id", async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting food" });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});