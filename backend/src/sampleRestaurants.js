// sampleRestaurants.js — demo restaurant data (no database code here).
// Sample restaurants placed around a centre point, used by `npm run seed`
// and by the admin "Add sample restaurants near me" button.

// Each sample is placed `north` / `east` km away from the centre
const samples = [
  { name: 'Fork & Flame', cuisines: ['Continental', 'Italian'], rating: 4.6, priceForTwo: 1200, north: 0.3, east: 0.2, openTime: '17:00', closeTime: '23:00', description: 'Fine dining with a wood-fired oven and seasonal menu.' },
  { name: 'Spice Route', cuisines: ['North Indian', 'Mughlai'], rating: 4.4, priceForTwo: 900, north: 1.2, east: -0.8, description: 'Rich curries, kebabs and fresh tandoori breads.' },
  { name: 'Dragon Bowl', cuisines: ['Chinese', 'Thai'], rating: 4.1, priceForTwo: 700, north: -0.9, east: 1.1, description: 'Wok-tossed noodles, dim sums and Thai curries.' },
  { name: 'Pizza Piazza', cuisines: ['Italian', 'Pizza'], rating: 4.2, priceForTwo: 800, north: 2.1, east: 0.6, description: 'Neapolitan style pizzas and handmade pasta.' },
  { name: 'Sagar Ratna Express', cuisines: ['South Indian'], rating: 4.0, priceForTwo: 450, north: -1.8, east: -0.4, openTime: '08:00', closeTime: '22:30', description: 'Crispy dosas, idli and filter coffee.' },
  { name: 'The Biryani House', cuisines: ['Biryani', 'Hyderabadi'], rating: 4.5, priceForTwo: 650, north: 0.7, east: 2.4, description: 'Dum biryani cooked slow in sealed handis.' },
  { name: 'Green Leaf Cafe', cuisines: ['Cafe', 'Healthy', 'Salads'], rating: 4.3, priceForTwo: 600, north: -2.6, east: 1.9, openTime: '09:00', closeTime: '21:00', description: 'Smoothie bowls, salads and great coffee.' },
  { name: 'Punjab Da Dhaba', cuisines: ['Punjabi', 'North Indian'], rating: 4.2, priceForTwo: 500, north: 3.4, east: -2.2, openTime: '00:00', closeTime: '00:00', description: 'Open 24 hours. Butter chicken, dal makhani and lassi.' },
  { name: 'Sushi Zen', cuisines: ['Japanese', 'Sushi'], rating: 4.6, priceForTwo: 1800, north: -3.1, east: -2.7, openTime: '12:00', closeTime: '23:00', description: 'Fresh sushi, ramen and izakaya small plates.' },
  { name: 'Burger Barn', cuisines: ['American', 'Burgers'], rating: 3.9, priceForTwo: 550, north: 4.2, east: 3.0, openTime: '11:00', closeTime: '03:00', description: 'Late-night smash burgers, loaded fries and thick shakes.' },
  { name: 'Coastal Curry', cuisines: ['Seafood', 'Goan', 'Kerala'], rating: 4.4, priceForTwo: 1100, north: -4.5, east: 0.8, description: 'Coastal seafood curries and fish fry.' },
  { name: 'Sweet Tooth Desserts', cuisines: ['Desserts', 'Bakery'], rating: 4.3, priceForTwo: 400, north: 1.5, east: -4.6, openTime: '10:00', closeTime: '23:30', description: 'Cakes, waffles, gelato and brownies.' },
]

const KM_PER_DEG_LAT = 111.32

export const sampleRestaurantsAround = (centerLat, centerLng) => {
  const toPoint = (north, east) => {
    const lat = centerLat + north / KM_PER_DEG_LAT
    const lng = centerLng + east / (KM_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180))
    return { type: 'Point', coordinates: [Number(lng.toFixed(6)), Number(lat.toFixed(6))] }
  }

  return samples.map(({ north, east, ...rest }, i) => ({
    ...rest,
    address: `Shop ${i + 1}, ${Math.hypot(north, east).toFixed(1)} km from city centre`,
    phone: `+91 98${String(10000000 + i * 1234567).slice(0, 8)}`,
    totalTables: 8 + (i % 5),
    isSample: true,
    location: toPoint(north, east),
  }))
}
