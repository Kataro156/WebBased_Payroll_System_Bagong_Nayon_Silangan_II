const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const morgan = require('morgan');
const winston = require('winston');
const path = require('path');

const app = express();  
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Serve frontend from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll-management')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// --- API ROUTES START HERE ---

// 1. Basic Login API
app.post('/api/login', (req, res) => {
    const { employeeId, password, role } = req.body;

    // TODO: Replace this hardcoded logic with actual MongoDB Database queries using Mongoose models.
    // Example: User.findOne({ employeeId, role })
    
    if (employeeId && password === 'password123') {
        // Successful login simulation
        res.json({ success: true, message: 'Login successful', role: role });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// --- API ROUTES END HERE ---

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(   
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
}); 

app.use(morgan(":method :url :status :response-time ms"));

const apiLogger = (req, res, next) => {
    const start = Date.now(); 
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            // Omitted params/body to keep logs clean
         });
    });
    next();
};

app.use(apiLogger);

app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});