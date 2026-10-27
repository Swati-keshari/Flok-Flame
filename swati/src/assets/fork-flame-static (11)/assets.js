// Static data and images for the Fork & Flame home page.
// - assets: hero and about images.
// - foodMenu: dishes shown in the home page "Our Menu" section (Menu.jsx). Also reused as
//   fallback photos for restaurants (utils/restaurantImage.js).
// - testimonials: customer reviews for Testimonial.jsx.
// - timeOptions, partySizeOptions, tableRefOptions: NOT used anywhere right now
//   (left over from an older reservation form). Safe to remove later.

import heroImg from './hero.avif';
import aboutImg from './about.avif';
import item1Img from './item1.avif';
import item2Img from './item2.avif';
import item3Img from './item3.avif';
import item4Img from './item4.avif';
import item5Img from './item5.avif';
import item6Img from './item6.avif';
import item7Img from './item7.avif';
import item8Img from './item8.avif';
import item9Img from './item9.avif';
import item10Img from './item10.avif';
import item11Img from './item11.avif';
import item12Img from './item12.avif';
import item13Img from './item13.avif';
import item14Img from './item14.avif';
import item15Img from './item15.avif';
import user1Img from './user1.jpg';
import user2Img from './user2.jpg';
import user3Img from './user3.jpg';

export const assets = {
  heroImg,
  aboutImg,
}

export const foodMenu = [
  {
    id: 1,
    image: item1Img,
    title: "Margherita Pizza",
    price: '₹299',
    category: "Veg",
    ingredients: "Cheese, tomato, basil",
    description: "Classic Italian Margherita pizza with a hand‑tossed crust, fresh tomato sauce, mozzarella cheese, and basil leaves baked in a wood‑fired oven."
  },
  {
    id: 2,
    image: item2Img,
    title: "Chicken Burger",
    price: '₹ 199',
    category: "Non‑Veg",
    ingredients: "Chicken patty, lettuce, cheese, mayo",
    description: "Juicy grilled chicken patty served in a toasted bun with lettuce, cheese, and creamy mayonnaise. Perfectly seasoned and cooked on a flat grill."
  },
  {
    id: 3,
    image: item3Img,
    title: "White Sauce Pasta",
    price: '₹ 249',
    category: "Veg",
    ingredients: "Penne pasta, white sauce, veggies",
    description: "Creamy white sauce pasta with sautéed vegetables like broccoli, bell peppers, and mushrooms, tossed with penne and garnished with cheese."
  },
  {
    id: 4,
    image: item4Img,
    title: "Mutton Biryani",
    price: '₹ 349',
    category: "Non‑Veg",
    ingredients: "Mutton, basmati rice, spices",
    description: "Fragrant basmati rice layered with tender mutton, saffron, and authentic Indian spices, cooked in a traditional dum style."
  },
  {
    id: 5,
    image: item5Img,
    title: "Caesar Salad",
    price: '₹ 179',
    category: "Veg",
    ingredients: "Lettuce, croutons, parmesan",
    description: "Fresh romaine lettuce with crispy croutons, grated parmesan cheese, and classic Caesar dressing — healthy and tasty."
  },
  {
    id: 6,
    image: item6Img,
    title: "Chocolate Ice Cream",
    price: '₹ 99',
    category: "Dessert",
    ingredients: "Milk, cocoa, sugar",
    description: "Rich and creamy chocolate ice cream made with premium cocoa and fresh milk, served chilled with chocolate chips."
  },
  {
    id: 7,
    image:item7Img,
    title: "Hakka Noodles",
    price: '₹ 189',
    category: "Veg",
    ingredients: "Noodles, veggies, soy sauce",
    description: "Stir‑fried Hakka noodles with crunchy vegetables and a spicy soy‑based sauce. A street‑style Indo‑Chinese favorite."
  },
  {
    id: 8,
    image: item8Img,
    title: "Cold Coffee",
    price: '₹ 129',
    category: "Beverage",
    ingredients: "Coffee, milk, sugar, ice",
    description: "Chilled blend of coffee and milk, sweetened and served over ice. Topped with a scoop of ice cream for extra delight."
  },
  {
    id: 9,
    image: item9Img,
    title: "Tomato Soup",
    price: '₹ 119',
    category: "Veg",
    ingredients: "Tomatoes, cream, herbs",
    description: "Creamy tomato soup slow‑cooked with herbs and spices, served with crunchy croutons. A perfect warm‑up dish."
  },
  {
    id: 10,
    image: item10Img,
    title: "Paneer Tikka",
    price: '₹ 269',
    category: "Veg",
    ingredients: "Paneer, yogurt, spices",
    description: "Chunks of marinated paneer grilled with capsicum and onions, infused with smoky flavors and served with mint chutney."
  },
  {
    id: 11,
    image: item11Img,
    title: "Grilled Fish",
    price: '₹ 329',
    category: "Non‑Veg",
    ingredients: "Fish fillet, lemon, herbs",
    description: "Fresh fish fillets marinated with lemon juice, herbs, and spices, then grilled to perfection. Served with a side salad."
  },
  {
    id: 12,
    image: item12Img,
    title: "Red Velvet Cake",
    price: '₹ 159',
    category: "Dessert",
    ingredients: "Flour, cocoa, cream cheese",
    description: "Moist and fluffy red velvet sponge layered with rich cream cheese frosting. A luxurious dessert experience."
  },
  {
    id: 13,
    image: item13Img,
    title: "Punjabi Samosa",
    price: '₹ 49',
    category: "Veg",
    ingredients: "Potato, peas, spices",
    description: "Crispy golden samosas stuffed with spicy potato and green peas filling, deep‑fried till perfect crunch. Served with tamarind chutney."
  },
  {
    id: 14,
    image: item14Img,
    title: "Strawberry Milkshake",
    price: '₹ 139',
    category: "Beverage",
    ingredients: "Milk, strawberries, ice cream",
    description: "Sweet and refreshing milkshake made with fresh strawberries, chilled milk, and vanilla ice cream."
  },
  {
    id: 15,
    image: item15Img,
    title: "Tandoori Chicken",
    price: '₹ 299',
    category: "Non‑Veg",
    ingredients: "Chicken, yogurt, spices",
    description: "Tender chicken pieces marinated in spiced yogurt and grilled in a tandoor for that perfect smoky flavor. Served with onion rings and lemon wedges."
  }
];

export const timeOptions = [
  { value: "", label: "Select Time" },
  { value: "17:00", label: "5:00 PM" },
  { value: "17:30", label: "5:30 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "18:30", label: "6:30 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "19:30", label: "7:30 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "20:30", label: "8:30 PM" },
  { value: "21:00", label: "9:00 PM" },
];

// Party size options
export const partySizeOptions = [
  { value: "", label: "Select Party Size" },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1} person${i + 1 > 1 ? "s" : ""}`,
  })),
];

// Table reference options
export const tableRefOptions = [
  { value: "", label: "Select Table Area" },
  { value: "window", label: "Window" },
  { value: "center", label: "Center" },
  { value: "outdoor", label: "Outdoor" },
];


export const testimonials = [
  {
    id: 1,
    name: "Amit Sharma",
    message: "Amazing food and ambience. Highly recommended!",
    image: user1Img,
  },
  {
    id: 2,
    name: "Priya Singh",
    message: "Service was excellent. Will visit again!",
    image: user2Img,
  },
  {
    id: 3,
    name: "Rahul Verma",
    message: "Loved the desserts and mocktails!",
    image: user3Img,
  },
];