/* config/db.js */
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        
        const conn = await mongoose.connect('mongodb+srv://yash454shukla_db_user:807J9rgIOVyyvAC1@cluster0.u1bpchc.mongodb.net/?appName=Cluster0');
        
        console.log(` MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(` Error: ${error.message}`);
        process.exit(1); // Stop the app if DB fails
    }
};

module.exports = connectDB;