// Mock data generation for hackathon presentation without a backend

// Mock data generation for hackathon presentation without a backend

const SOUTH_INDIAN_LOCATIONS = [
    { name: 'Bangalore - Indiranagar', lat: 12.9784, lng: 77.6408 },
    { name: 'Bangalore - Whitefield', lat: 12.9698, lng: 77.7499 },
    { name: 'Bangalore - Koramangala', lat: 12.9352, lng: 77.6245 },
    { name: 'Chennai - Adyar', lat: 13.0033, lng: 80.2550 },
    { name: 'Chennai - T. Nagar', lat: 13.0418, lng: 80.2341 },
    { name: 'Chennai - Velachery', lat: 12.9791, lng: 80.2185 },
    { name: 'Hyderabad - Gachibowli', lat: 17.4401, lng: 78.3489 },
    { name: 'Hyderabad - Banjara Hills', lat: 17.4123, lng: 78.4435 },
    { name: 'Hyderabad - Secunderabad', lat: 17.4399, lng: 78.4983 },
    { name: 'Kochi - Fort Kochi', lat: 9.9658, lng: 76.2421 },
    { name: 'Kochi - Kakkanad', lat: 10.0159, lng: 76.3507 },
    { name: 'Mysuru - Gokulam', lat: 12.3361, lng: 76.6341 },
    { name: 'Coimbatore - RS Puram', lat: 11.0089, lng: 76.9531 },
    { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
    { name: 'Madurai - Meenakshi Temple', lat: 9.9195, lng: 78.1193 },
    { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
    { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
    { name: 'Puducherry - White Town', lat: 11.9338, lng: 79.8298 }
];

const generateRandomOffset = (scale) => (Math.random() - 0.5) * scale;

export const generateMockSensors = (count = 100) => {
    return Array.from({ length: count }).map((_, i) => {
        // Pick a location randomly or sequentially
        const location = SOUTH_INDIAN_LOCATIONS[i % SOUTH_INDIAN_LOCATIONS.length];

        // Determine status based on random probability (60% safe, 25% warning, 15% danger)
        const rand = Math.random();
        let status = 'safe';
        let ph = 7.0 + generateRandomOffset(0.4);
        let turbidity = 1.0 + Math.random() * 2;
        let contaminants = Math.random() * 10;

        if (rand > 0.85) {
            status = 'danger';
            ph = 5.5 + generateRandomOffset(1.0); // Acidic
            turbidity = 5.0 + Math.random() * 10;
            contaminants = 50 + Math.random() * 100;
        } else if (rand > 0.60) {
            status = 'warning';
            ph = 6.5 + generateRandomOffset(0.5);
            turbidity = 3.0 + Math.random() * 3;
            contaminants = 20 + Math.random() * 30;
        }

        const aiRiskScore = status === 'danger' ? 92 : status === 'warning' ? 62 : 12;

        let aiInsight = "Water quality within optimal parameters.";
        if (status === 'danger') {
            aiInsight = "Critical level of heavy metals detected. Immediate isolation of sector recommended.";
        } else if (status === 'warning') {
            aiInsight = "Slight turbidity spike detected. Potential sediment influx from upstream runoff.";
        }

        return {
            id: `SNSR-${1000 + i}`,
            lat: location.lat + generateRandomOffset(0.2), // Added a bit of jitter around the city
            lng: location.lng + generateRandomOffset(0.2),
            status,
            metrics: {
                ph: ph.toFixed(2),
                turbidity: turbidity.toFixed(1),
                contaminants: contaminants.toFixed(1),
                lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
            },
            aiRiskScore,
            aiInsight,
            locationName: `${location.name} - Unit ${String.fromCharCode(65 + (i % 26))}`
        };
    });
};

export const getChartData = () => {
    const data = [];
    let currentUsage = 1500;
    let currentQuality = 85;

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        data.push({
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            usage: Math.round(currentUsage + generateRandomOffset(400)),
            qualityScore: Math.round(currentQuality + generateRandomOffset(10)),
        });
    }
    return data;
};

// AI Prediction trajectory for dashboard
export const getAIPredictions = () => {
    const data = [];
    let baseScore = 70;
    for (let i = 1; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        data.push({
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            predictedRisk: Math.max(10, Math.min(100, Math.round(baseScore + generateRandomOffset(30)))),
        });
        baseScore += i * 2; // Trend upwards slightly to show an impending issue
    }
    return data;
};
