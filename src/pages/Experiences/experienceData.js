export const experienceData = [
  {
    id: "exp-1",
    title: "Hidden Gems of Colaba Walk with a Local History Nerd",
    description: "Discover the hidden colonial secrets of South Mumbai. We'll explore forgotten alleyways, hear stories of the British Raj, and eat the best Irani cafe completely off the tourist map.",
    rating: 4.96,
    reviewCount: 312,
    city: "Mumbai",
    category: "Walking tours",
    pricePerGuest: 1250,
    freeCancellation: true,
    images: [
      "https://images.unsplash.com/photo-1570168007204-dfb528c6858f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620802051772-2ea90bfce81f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop"
    ],
    host: {
      name: "Test User",
      avatar: "https://ui-avatars.com/api/?name=Test+User&background=random",
      tagline: "Local Mumbai Guide & History Buff",
      about: "I'm a native Mumbaikar who grew up wandering the streets of Colaba. I've spent the last 10 years researching the city's architectural history.\n\nMy passion is showing people the authentic side of Mumbai that most visitors miss. Join me for an unforgettable journey through time!",
    },
    meetingPoint: {
      name: "Gateway of India Plaza",
      address: "Apollo Bandar, Colaba",
      coordinates: [18.9220, 72.8347]
    },
    itinerary: [
      { title: "Meet at Gateway of India", description: "We start our journey with a brief introduction to the iconic monument and its history.", image: "https://images.unsplash.com/photo-1565552643954-1eb95316dbbc?q=80&w=300&auto=format&fit=crop" },
      { title: "Explore Heritage Streets", description: "Walk through the architectural wonders of Colaba.", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6858f?q=80&w=300&auto=format&fit=crop" },
      { title: "Irani Cafe Break", description: "Stop at a 100-year-old cafe for cutting chai and bun maska.", image: "https://images.unsplash.com/photo-1582221808028-c17cb037d4f3?q=80&w=300&auto=format&fit=crop" }
    ],
    availableDates: [
      { date: new Date(Date.now() + 86400000).toISOString(), timeRange: "5:00 – 8:30 pm", spotsAvailable: 8 },
      { date: new Date(Date.now() + 172800000).toISOString(), timeRange: "4:00 – 7:30 pm", spotsAvailable: 5 },
      { date: new Date(Date.now() + 259200000).toISOString(), timeRange: "5:00 – 8:30 pm", spotsAvailable: 10 }
    ],
    guestRequirements: "Up to 10 guests ages 12 and up can attend.",
    activityLevel: "Moderate. Expect around 3km of walking.",
    accessibility: "Not wheelchair accessible due to uneven pavements.",
    duration: "3.5 hours",
    groupSize: 10,
    languages: ["English", "Hindi", "Marathi"],
    includes: ["Snacks", "Drinks", "Tickets"]
  }
];
