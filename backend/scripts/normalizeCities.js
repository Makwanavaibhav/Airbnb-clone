const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Experience = require('../models/Experience');
const Service = require('../models/Service');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const normalize = str => {
    if (!str) return str;
    const parts = str.trim().split(' ');
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
};

async function run() {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "hotelsdb" });
        console.log("Connected. Starting city normalization migration...");

        // Hotels
        const hotels = await Hotel.find({});
        for (const h of hotels) {
            if (h.city) {
                const norm = normalize(h.city);
                if (norm !== h.city) {
                    h.city = norm;
                    await h.save();
                }
            } else if (h.location) {
                // If it doesn't have city but has location, derive city for search
                const norm = normalize(h.location.split(',')[0]);
                h.city = norm;
                await h.save();
            }
        }
        console.log(`Normalized ${hotels.length} hotels.`);

        // Experiences
        const experiences = await Experience.find({});
        for (const e of experiences) {
            if (e.city) {
                const norm = normalize(e.city);
                if (norm !== e.city) {
                    e.city = norm;
                    await e.save();
                }
            }
        }
        console.log(`Normalized ${experiences.length} experiences.`);

        // Services
        const services = await Service.find({});
        for (const s of services) {
            if (s.city) {
                const norm = normalize(s.city);
                if (norm !== s.city) {
                    s.city = norm;
                    await s.save();
                }
            }
        }
        console.log(`Normalized ${services.length} services.`);

        console.log("Adding Indexes");
        await Hotel.collection.createIndex({ city: 1 });
        await Experience.collection.createIndex({ city: 1 });
        await Service.collection.createIndex({ city: 1 });

        console.log("City normalization and indexing complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed", err);
        process.exit(1);
    }
}

run();
