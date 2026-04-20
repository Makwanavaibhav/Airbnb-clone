/**
 * Seed script: backend/scripts/seedTestData.js
 * Run: node backend/scripts/seedTestData.js
 *
 * Creates test@airbnb.com host + seeds Hotels, Experiences, Services.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Experience = require('../models/Experience');
const Service = require('../models/Service');

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌  MONGODB_URI not found in .env');
  process.exit(1);
}

// ─── Image pools ──────────────────────────────────────────────────────────────
const hotelImages = {
  goa:     ['https://images.unsplash.com/photo-1506974210756-8e1b8985d348?w=800&q=80',
             'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80'],
  mumbai:  ['https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80',
             'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&q=80'],
  udaipur: ['https://images.unsplash.com/photo-1600077106724-946750eeaf3c?w=800&q=80',
             'https://images.unsplash.com/photo-1599413987323-b2b8c0d7d9c8?w=800&q=80'],
};

const expImages = [
  'https://images.unsplash.com/photo-1541535650810-10d26f5c2ab3?w=800&q=80',
  'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80',
  'https://images.unsplash.com/photo-1544551763-92ab472cad5d?w=800&q=80',
];

const svcImages = [
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
  'https://images.unsplash.com/photo-1587837073080-448bc6a2329b?w=800&q=80',
  'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=800&q=80',
];

async function makeDates(count) {
  const slots = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i * 3);
    slots.push({ date: d, timeRange: '10:00 AM – 12:00 PM', spotsAvailable: 8 });
  }
  return slots;
}

async function seed() {
  await mongoose.connect(MONGO_URI, { dbName: 'hotelsdb' });
  console.log('✅  Connected to MongoDB');

  // ── 1. Find or create test host ───────────────────────────────────────────
  let host = await User.findOne({ email: 'test@airbnb.com' });
  if (!host) {
    const hashedPw = bcrypt.hashSync('password123', 10);
    host = await User.create({
      firstName: 'Test',
      lastName: 'Host',
      email: 'test@airbnb.com',
      password: hashedPw,
      isHost: true,
    });
    console.log('👤  Created test host:', host._id);
  } else {
    console.log('👤  Using existing host:', host._id);
    // Ensure isHost flag is set
    if (!host.isHost) {
      host.isHost = true;
      await host.save();
    }
  }

  const hostId = host._id;

  // ── 2. Upsert Hotels ─────────────────────────────────────────────────────
  const hotelsData = [
    {
      title: 'Beachside Villa in North Goa',
      location: 'Goa, India',
      city: 'Goa',
      pricePerNight: 4500,
      priceRaw: 4500,
      price: '₹4,500',
      rating: 4.92,
      images: hotelImages.goa,
      image: hotelImages.goa[0],
      hostName: 'Test Host',
      description: 'A stunning beachside villa just steps from Baga Beach, featuring private pool and ocean views.',
      guests: 6,
      bedrooms: 3,
      beds: 4,
      baths: 2,
      amenities: ['WiFi', 'Pool', 'Air conditioning', 'Kitchen', 'Parking'],
      hostId,
      propertyType: 'Villa',
      lat: 15.5557,
      lng: 73.7625,
    },
    {
      title: 'Cozy Studio in Mumbai',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      pricePerNight: 2800,
      priceRaw: 2800,
      price: '₹2,800',
      rating: 4.76,
      images: hotelImages.mumbai,
      image: hotelImages.mumbai[0],
      hostName: 'Test Host',
      description: 'Modern studio apartment in the heart of Bandra, close to all amenities.',
      guests: 2,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      amenities: ['WiFi', 'Air conditioning', 'Kitchen'],
      hostId,
      propertyType: 'Apartment',
      lat: 19.0596,
      lng: 72.8295,
    },
    {
      title: 'Heritage Haveli in Udaipur',
      location: 'Udaipur, Rajasthan',
      city: 'Udaipur',
      pricePerNight: 6500,
      priceRaw: 6500,
      price: '₹6,500',
      rating: 4.98,
      images: hotelImages.udaipur,
      image: hotelImages.udaipur[0],
      hostName: 'Test Host',
      description: 'Experience royal living in a 150-year-old haveli overlooking Lake Pichola.',
      guests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 2,
      amenities: ['WiFi', 'Air conditioning', 'Kitchen', 'Lake view', 'Rooftop terrace'],
      hostId,
      propertyType: 'Heritage',
      lat: 24.5854,
      lng: 73.6814,
    },
    {
      title: 'Surf Shack near Anjuna Beach',
      location: 'Goa, India',
      city: 'Goa',
      pricePerNight: 3200,
      priceRaw: 3200,
      price: '₹3,200',
      rating: 4.85,
      images: [hotelImages.goa[1], hotelImages.goa[0]],
      image: hotelImages.goa[1],
      hostName: 'Test Host',
      description: 'Chill surf shack vibes near Anjuna beach. Perfect for backpackers and surfers.',
      guests: 3,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      amenities: ['WiFi', 'Surfboards', 'Beach access'],
      hostId,
      propertyType: 'Cabin',
      lat: 15.5793,
      lng: 73.7418,
    },
    {
      title: 'Luxury Penthouse in South Mumbai',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      pricePerNight: 9800,
      priceRaw: 9800,
      price: '₹9,800',
      rating: 4.97,
      images: [hotelImages.mumbai[1], hotelImages.mumbai[0]],
      image: hotelImages.mumbai[1],
      hostName: 'Test Host',
      description: 'Stunning panoramic penthouse in the most prestigious address in South Mumbai.',
      guests: 8,
      bedrooms: 4,
      beds: 5,
      baths: 3,
      amenities: ['WiFi', 'Pool', 'Gym', 'Air conditioning', 'Sea view', 'Butler service'],
      hostId,
      propertyType: 'Penthouse',
      lat: 18.9220,
      lng: 72.8347,
    },
  ];

  let hotelCount = 0;
  for (const data of hotelsData) {
    const exists = await Hotel.findOne({ title: data.title, hostId });
    if (!exists) {
      await Hotel.create(data);
      hotelCount++;
    }
  }
  console.log(`🏨  Hotels seeded: ${hotelCount} new (${hotelsData.length - hotelCount} already existed)`);

  // ── 3. Upsert Experiences ──────────────────────────────────────────────────
  const experiencesData = [
    {
      title: 'Sunrise Yoga on Goa Beach',
      description: 'Start your morning with an energizing yoga session on the sandy shores of Goa. Suitable for all experience levels.',
      city: 'Goa',
      location: 'Goa, India',
      pricePerPerson: 850,
      duration: '90 minutes',
      images: [expImages[0], expImages[4]],
      hostId,
      hostName: 'Test Host',
      category: 'Wellness',
      rating: 4.95,
      reviewCount: 124,
      groupSize: 12,
      availableDates: await makeDates(6),
      freeCancellation: true,
      tags: ['Wellness', 'Nature', 'Fitness'],
      meetingPoint: { address: 'Goa, 403001', lat: 15.2993, lng: 74.1240 },
    },
    {
      title: 'Mumbai Street Food Safari',
      description: 'Explore the vibrant street food scene of Mumbai with a local food connoisseur. Taste everything from vada pav to pani puri.',
      city: 'Mumbai',
      location: 'Mumbai, Maharashtra',
      pricePerPerson: 1200,
      duration: '3 hours',
      images: [expImages[1], expImages[3]],
      hostId,
      hostName: 'Test Host',
      category: 'Food & Drink',
      rating: 4.98,
      reviewCount: 312,
      groupSize: 8,
      availableDates: await makeDates(8),
      freeCancellation: true,
      tags: ['Food & Drink', 'Culture', 'Local'],
      meetingPoint: { address: 'Mumbai, Maharashtra, 400001', lat: 18.9388, lng: 72.8354 },
    },
    {
      title: 'Udaipur Boat Ride & Sunset Photos',
      description: 'A magical boat ride on Lake Pichola at sunset, with a professional photographer capturing your best moments.',
      city: 'Udaipur',
      location: 'Udaipur, Rajasthan',
      pricePerPerson: 2200,
      duration: '2 hours',
      images: [expImages[2], expImages[0]],
      hostId,
      hostName: 'Test Host',
      category: 'Sightseeing',
      rating: 5.0,
      reviewCount: 430,
      groupSize: 6,
      availableDates: await makeDates(5),
      freeCancellation: true,
      tags: ['Sightseeing', 'Photography', 'Romantic'],
      meetingPoint: { address: 'Udaipur, Rajasthan, 313004', lat: 24.5854, lng: 73.7125 },
    },
    {
      title: 'Goa Spice Farm Walk',
      description: 'Walk through a traditional spice plantation in the lush forests of Old Goa. Learn about exotic spices used in Indian cuisine.',
      city: 'Goa',
      location: 'Goa, India',
      pricePerPerson: 650,
      duration: '2.5 hours',
      images: [expImages[3], expImages[2]],
      hostId,
      hostName: 'Test Host',
      category: 'Nature',
      rating: 4.88,
      reviewCount: 89,
      groupSize: 15,
      availableDates: await makeDates(7),
      freeCancellation: true,
      tags: ['Nature', 'Food & Drink', 'Culture'],
      meetingPoint: { address: 'Goa, 403001', lat: 15.2993, lng: 74.1240 },
    },
    {
      title: 'Mumbai Dharavi Art Walk',
      description: 'Explore the vibrant art scene of Dharavi with local artists. Discover murals, workshops, and the incredible human stories behind them.',
      city: 'Mumbai',
      location: 'Mumbai, Maharashtra',
      pricePerPerson: 1500,
      duration: '3 hours',
      images: [expImages[4], expImages[1]],
      hostId,
      hostName: 'Test Host',
      category: 'Culture',
      rating: 4.93,
      reviewCount: 201,
      groupSize: 10,
      availableDates: await makeDates(6),
      freeCancellation: true,
      tags: ['Art', 'Culture', 'Social Impact'],
      meetingPoint: { address: 'Mumbai, Maharashtra, 400001', lat: 18.9388, lng: 72.8354 },
    },
  ];

  let expCount = 0;
  for (const data of experiencesData) {
    const result = await Experience.updateOne(
      { title: data.title, hostId },
      { $set: data },
      { upsert: true }
    );
    if (result.upsertedCount) expCount++;
  }
  console.log(`🎭  Experiences seeded: ${expCount} new/updated`);

  // ── 4. Upsert Services ────────────────────────────────────────────────────
  const servicesData = [
    {
      title: 'Private Chef & Catering – Goa',
      description: 'Enjoy gourmet Goan and international cuisine prepared in your villa by a professional local chef.',
      city: 'Goa',
      location: 'Goa, India',
      pricePerSession: 4500,
      serviceType: 'Chef',
      images: [svcImages[0], svcImages[3]],
      hostId,
      hostName: 'Test Host',
      rating: 4.9,
      reviewCount: 76,
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      tags: ['Chef', 'Food', 'Catering'],
      serviceArea: { lat: 15.2993, lng: 74.1240, radiusMeters: 20000 },
    },
    {
      title: 'In-home Spa & Massage – Mumbai',
      description: 'Relax with a premium Ayurvedic massage or spa treatment without leaving your accommodation.',
      city: 'Mumbai',
      location: 'Mumbai, Maharashtra',
      pricePerSession: 2800,
      serviceType: 'Spa',
      images: [svcImages[1], svcImages[4]],
      hostId,
      hostName: 'Test Host',
      rating: 5.0,
      reviewCount: 143,
      availability: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
      tags: ['Spa', 'Massage', 'Wellness'],
      serviceArea: { lat: 18.9388, lng: 72.8354, radiusMeters: 18000 },
    },
    {
      title: 'Daily Housekeeping – Udaipur',
      description: 'Keep your heritage space spotless with our trusted daily cleaning professionals.',
      city: 'Udaipur',
      location: 'Udaipur, Rajasthan',
      pricePerSession: 1200,
      serviceType: 'Housekeeping',
      images: [svcImages[2], svcImages[0]],
      hostId,
      hostName: 'Test Host',
      rating: 4.8,
      reviewCount: 58,
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      tags: ['Housekeeping', 'Cleaning'],
      serviceArea: { lat: 24.5854, lng: 73.7125, radiusMeters: 15000 },
    },
    {
      title: 'Personal Fitness Trainer – Goa',
      description: 'Get fit with personalized training sessions on the beach or at your villa from a certified trainer.',
      city: 'Goa',
      location: 'Goa, India',
      pricePerSession: 1800,
      serviceType: 'Fitness',
      images: [svcImages[4], svcImages[1]],
      hostId,
      hostName: 'Test Host',
      rating: 4.85,
      reviewCount: 32,
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      tags: ['Fitness', 'Training', 'Wellness'],
      serviceArea: { lat: 15.2993, lng: 74.1240, radiusMeters: 20000 },
    },
    {
      title: 'Photography Session – Mumbai',
      description: 'Professional lifestyle and travel photography session around iconic Mumbai locations.',
      city: 'Mumbai',
      location: 'Mumbai, Maharashtra',
      pricePerSession: 5500,
      serviceType: 'Photography',
      images: [svcImages[3], svcImages[2]],
      hostId,
      hostName: 'Test Host',
      rating: 4.97,
      reviewCount: 91,
      availability: ['Tue', 'Thu', 'Sat', 'Sun'],
      tags: ['Photography', 'Portraits', 'Memories'],
      serviceArea: { lat: 18.9388, lng: 72.8354, radiusMeters: 18000 },
    },
  ];

  let svcCount = 0;
  for (const data of servicesData) {
    const result = await Service.updateOne(
      { title: data.title, hostId },
      { $set: data },
      { upsert: true }
    );
    if (result.upsertedCount) svcCount++;
  }
  console.log(`🛎️   Services seeded: ${svcCount} new/updated`);

  console.log('\n✅  Seeding complete!');
  console.log(`\n📋  Test credentials:\n   Email: test@airbnb.com\n   Password: password123`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seeding failed:', err);
  process.exit(1);
});
