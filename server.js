const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// --- 1. CONNECT TO MONGODB ---
// PASTE YOUR REAL CONNECTION STRING HERE!
const MONGO_URI = 'mongodb+srv://yash454shukla_db_user:807J9rgIOVyyvAC1@cluster0.u1bpchc.mongodb.net/?appName=Cluster0'; 

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ DailyMart DB Connected!'))
    .catch(err => console.error('❌ DB Error:', err));

// --- 2. SCHEMAS ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
    username: String,
    items: Array,
    total: Number,
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// --- 3. PRODUCT DATA ---
const products = [
    { 
        id: 1, 
        name: "ASUS TUF Gaming F15", 
        price: 58990, 
        category: "Laptops",
        description: "Powered for serious gaming and real-world durability, the TUF Gaming F15 is a fully-loaded Windows 10 Pro gaming laptop that can carry you to victory.", 
        image: "https://dlcdnwebimgs.asus.com/gain/3a36a12f-9a0d-488c-bef3-05431f041b96/" 
    },
    { 
        id: 2, 
        name: "BoAt Rockerz 450", 
        price: 1499, 
        category: "Audio",
        description: "Go wireless with Bluetooth V4.2 and carry the vibe wherever you go. The 40mm dynamic drivers help pump out immersive audio all day long.", 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjjELXKFkeZh33izqeuiD8oj-KeNdeS9r6Mw&s" 
    },
    { 
        id: 3, 
        name: "Noise ColorFit Pro 4", 
        price: 2499, 
        category: "Wearables",
        description: "Get the best view with a 1.72'' display. Manage calls, health, and social media notifications from your wrist.", 
        image: "https://joytreeglobal.com/wp-content/uploads/Noise-ColorFit-Pro-4-Advanced-Bluetooth-Calling-Smart-Watch_4.png"
    },
    { 
        id: 4, 
        name: "Redgear Shadow Blade", 
        price: 1899, 
        category: "Accessories",
        description: "Mechanical keyboard with Blue Clicky Switches, Floating Keycaps, and RGB Lighting modes for the ultimate gaming setup.", 
        image: "https://m.media-amazon.com/images/S/aplus-media-library-service-media/00fca0e6-bf73-4db7-894b-333d8ad56617.__CR0,0,970,600_PT0_SX970_V1___.jpg" 
    },
    { 
        id: 5, 
        name: "Logitech G102 Mouse", 
        price: 1295, 
        category: "Accessories",
        description: "Make the most of your game time with G102 gaming mouse, featuring LIGHTSYNC technology and 8000 DPI.", 
        image: "https://m.media-amazon.com/images/I/61RYwHoeHjL.jpg" 
    },
    { 
        id: 6, 
        name: "Samsung 24 Curved", 
        price: 10499, 
        category: "Monitors",
        description: "1800R curved screen for a more immersive experience. AMD FreeSync minimizes stutter and ensures flawlessly smooth gameplay.", 
        image: "https://image-us.samsung.com/SamsungUS/pim/migration/computing/monitors/curved/lc24f390fhnxza/Pdpdefault-lc24f390fhnxza-600x600-C1-052016.jpg?$product-details-jpg$?$product-details-jpg$" 
    }
];

// --- 4. ROUTES ---

// Get ALL Products
app.get('/api/products', (req, res) => res.json(products));

// NEW: Get SINGLE Product (Essential for Details Page)
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: "Product not found" });
});

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (await User.findOne({ username })) return res.status(400).json({ message: "User exists" });
        await new User({ username, password }).save();
        res.json({ message: "Registered! Please Login." });
    } catch (e) { res.status(500).json({ message: "Error" }); }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    user ? res.json({ username: user.username }) : res.status(401).json({ message: "Invalid Details" });
});

app.post('/api/orders', async (req, res) => {
    const { username, items } = req.body;
    const total = items.reduce((sum, i) => sum + i.price, 0);
    await new Order({ username, items, total }).save();
    res.json({ message: `Order Placed Successfully! Total: ₹${total}` });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));