/* server.js */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

const mongoose = require('mongoose');

// --- SCHEMAS ---

// 1. Product Schema
const productSchema = new mongoose.Schema({
    name: String, 
    price: Number, 
    description: String, 
    image: String,
    details: String // Extra details for the "Details Page"
});

// 2. User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// 3. Order Schema (New Requirement)
const orderSchema = new mongoose.Schema({
    username: String,
    items: Array,
    total: Number,
    date: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// --- ROUTES ---

// Get All Products
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: "User already exists" });
        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ message: "Registration successful! Please login." });
    } catch (err) { res.status(500).json({ message: "Error registering." }); }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) res.json({ message: "Success", username: user.username });
        else res.status(401).json({ message: "Invalid credentials" });
    } catch (err) { res.status(500).json({ message: "Error logging in." }); }
});

// Place Order
app.post('/api/orders', async (req, res) => {
    try {
        const { username, items, total } = req.body;
        const newOrder = new Order({ username, items, total });
        await newOrder.save();
        res.json({ message: "Order placed successfully!" });
    } catch (err) { res.status(500).json({ message: "Error saving order." }); }
});

// Seed Database (Run once to get INR prices)
app.get('/api/seed', async (req, res) => {
    await Product.deleteMany({});
    await Product.create([
        { 
            name: "Sony WH-1000XM5", 
            price: 24990, 
            description: "Industry-leading noise canceling headphones.", 
            image: "https://assets.ajio.com/medias/sys_master/root/20240703/sLa1/6685d1981d763220fac47a43/-473Wx593H-4938418040-multi-MODEL.jpg",
            details: "30-hour battery life, crystal clear hands-free calling, and multipoint connection."
        },
        { 
            name: "Apple Watch Series 9", 
            price: 41900, 
            description: "Smarter, brighter, and mightier.", 
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv-aF_ddTM6jYAYO94k-hdmVNayUTfrJ3WzQ&s",
            details: "Advanced health sensors, double tap gesture, and carbon neutral combinations."
        },
        { 
            name: "Logitech G502 Hero", 
            price: 3995, 
            description: "High performance gaming mouse.", 
            image: "https://m.media-amazon.com/images/I/51ZLPEu0SmS.jpg",
            details: "HERO 25K sensor, 11 programmable buttons, and adjustable weight system."
        },
        { 
            name: "Keychron K2 V2", 
            price: 8499, 
            description: "Wireless mechanical keyboard.", 
            image: "https://i.ytimg.com/vi/ksbu_dG1QSM/maxresdefault.jpg",
            details: "Compact 75% layout, Gateron G Pro switches, and connects with up to 3 devices."
        },
        { 
            name: "Nike Air Jordan 1", 
            price: 16995, 
            description: "The sneaker that started it all.", 
            image: "https://www.superkicks.in/cdn/shop/files/1_675361ea-f321-4a48-a143-81a1d2800a71.jpg?v=1734518674&width=1946",
            details: "Premium leather upper, air-sole unit for cushioning, and solid rubber outsole."
        },
        { 
            name: "Canon EOS 1500D", 
            price: 47990, 
            description: "For all photography enthusiasts.", 
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            details: "24.1 MP APS-C CMOS sensor, DIGIC 4+ image processor, and Full HD video."
        }
    ]);
    res.send("Database Updated with INR Prices!");
});

app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));