// sampleMenus.js — demo menu data (no database code here).
// Used by seed.js, seedMenus.js and the admin "sample restaurants" button.
// Sample menu items, chosen by a restaurant's cuisines.
// [name, price, category, isVeg, description]
const menus = {
  'north indian': [
    ['Paneer Butter Masala', 280, 'Main Course', true, 'Cottage cheese in a rich tomato-butter gravy'],
    ['Dal Makhani', 220, 'Main Course', true, 'Black lentils slow cooked overnight with cream'],
    ['Butter Chicken', 340, 'Main Course', false, 'Tandoori chicken in creamy makhani gravy'],
    ['Chicken Tikka', 300, 'Starters', false, 'Smoky boneless chicken from the tandoor'],
    ['Paneer Tikka', 260, 'Starters', true, 'Marinated paneer grilled with peppers and onion'],
    ['Butter Naan', 50, 'Breads', true, 'Soft tandoor-baked naan brushed with butter'],
    ['Jeera Rice', 150, 'Rice', true, 'Basmati rice tempered with cumin'],
    ['Gulab Jamun (2 pcs)', 90, 'Desserts', true, 'Warm milk dumplings in rose syrup'],
  ],
  chinese: [
    ['Veg Hakka Noodles', 180, 'Noodles', true, 'Wok-tossed noodles with crunchy vegetables'],
    ['Chicken Hakka Noodles', 220, 'Noodles', false, 'Stir-fried noodles with chicken and soy'],
    ['Veg Manchurian', 190, 'Starters', true, 'Vegetable dumplings in spicy Manchurian sauce'],
    ['Chilli Chicken', 260, 'Starters', false, 'Crispy chicken tossed with peppers and chilli'],
    ['Veg Fried Rice', 170, 'Rice', true, 'Classic Indo-Chinese fried rice'],
    ['Veg Momos (8 pcs)', 140, 'Starters', true, 'Steamed dumplings with spicy red chutney'],
    ['Hot & Sour Soup', 130, 'Soups', true, 'Tangy and spicy vegetable soup'],
  ],
  italian: [
    ['Margherita Pizza', 299, 'Pizza', true, 'Tomato sauce, mozzarella and fresh basil'],
    ['Farmhouse Pizza', 379, 'Pizza', true, 'Onion, capsicum, mushroom and sweet corn'],
    ['Pepperoni Pizza', 449, 'Pizza', false, 'Loaded with chicken pepperoni and cheese'],
    ['White Sauce Pasta', 249, 'Pasta', true, 'Penne in creamy cheese sauce with veggies'],
    ['Arrabbiata Pasta', 239, 'Pasta', true, 'Penne in spicy tomato and garlic sauce'],
    ['Garlic Bread', 129, 'Sides', true, 'Toasted bread with garlic butter and herbs'],
    ['Tiramisu', 199, 'Desserts', true, 'Coffee-soaked layers with mascarpone cream'],
  ],
  'south indian': [
    ['Masala Dosa', 140, 'Dosa', true, 'Crispy dosa stuffed with spiced potato'],
    ['Mysore Masala Dosa', 160, 'Dosa', true, 'Dosa with spicy red chutney and potato'],
    ['Idli Sambar (2 pcs)', 90, 'Breakfast', true, 'Steamed rice cakes with sambar and chutney'],
    ['Medu Vada (2 pcs)', 100, 'Breakfast', true, 'Crispy lentil doughnuts'],
    ['Uttapam', 150, 'Dosa', true, 'Thick rice pancake topped with onion and tomato'],
    ['Filter Coffee', 60, 'Beverages', true, 'Strong South Indian coffee with milk'],
  ],
  biryani: [
    ['Chicken Dum Biryani', 299, 'Biryani', false, 'Basmati rice and chicken cooked dum style'],
    ['Mutton Biryani', 379, 'Biryani', false, 'Tender mutton layered with saffron rice'],
    ['Veg Dum Biryani', 229, 'Biryani', true, 'Seasonal vegetables with fragrant rice'],
    ['Egg Biryani', 239, 'Biryani', false, 'Spiced rice with boiled eggs'],
    ['Chicken 65', 249, 'Starters', false, 'Spicy deep-fried chicken bites'],
    ['Raita', 60, 'Sides', true, 'Cool yogurt with cucumber and onion'],
    ['Double Ka Meetha', 120, 'Desserts', true, 'Hyderabadi bread pudding'],
  ],
  cafe: [
    ['Cappuccino', 150, 'Coffee', true, 'Espresso with steamed milk foam'],
    ['Cold Coffee', 170, 'Coffee', true, 'Chilled coffee blended with ice cream'],
    ['Caesar Salad', 220, 'Salads', true, 'Romaine, croutons, parmesan and Caesar dressing'],
    ['Avocado Toast', 260, 'Breakfast', true, 'Sourdough with smashed avocado and chilli'],
    ['Grilled Chicken Sandwich', 240, 'Sandwiches', false, 'Herbed chicken with lettuce and mayo'],
    ['Acai Smoothie Bowl', 290, 'Healthy', true, 'Berries, banana, granola and honey'],
  ],
  japanese: [
    ['Salmon Nigiri (2 pcs)', 450, 'Sushi', false, 'Fresh salmon over seasoned rice'],
    ['California Roll (8 pcs)', 520, 'Sushi', false, 'Crab, avocado and cucumber roll'],
    ['Avocado Maki (8 pcs)', 380, 'Sushi', true, 'Simple avocado roll'],
    ['Chicken Ramen', 480, 'Ramen', false, 'Rich broth, noodles, chicken and egg'],
    ['Veg Gyoza (6 pcs)', 320, 'Starters', true, 'Pan-fried vegetable dumplings'],
    ['Miso Soup', 180, 'Soups', true, 'Classic soybean broth with tofu'],
  ],
  american: [
    ['Classic Chicken Burger', 199, 'Burgers', false, 'Grilled chicken, lettuce, cheese, mayo'],
    ['Veg Smash Burger', 179, 'Burgers', true, 'Crispy veg patty with cheese and pickles'],
    ['Double Cheese Burger', 279, 'Burgers', false, 'Two chicken patties with double cheese'],
    ['Loaded Fries', 169, 'Sides', true, 'Fries with cheese sauce and jalapenos'],
    ['Chicken Wings (6 pcs)', 249, 'Starters', false, 'Tossed in spicy buffalo sauce'],
    ['Chocolate Shake', 159, 'Shakes', true, 'Thick chocolate milkshake'],
  ],
  seafood: [
    ['Goan Fish Curry', 380, 'Main Course', false, 'Fish in tangy coconut curry'],
    ['Prawn Masala', 420, 'Main Course', false, 'Prawns in spicy onion-tomato masala'],
    ['Fish Fry', 340, 'Starters', false, 'Rava-coated crispy fried fish'],
    ['Kerala Veg Stew', 260, 'Main Course', true, 'Vegetables in mild coconut milk'],
    ['Appam (2 pcs)', 80, 'Breads', true, 'Soft lacy rice pancakes'],
    ['Steamed Rice', 100, 'Rice', true, 'Plain steamed rice'],
  ],
  desserts: [
    ['Red Velvet Pastry', 159, 'Cakes', true, 'Moist red velvet with cream cheese frosting'],
    ['Chocolate Truffle Cake (500g)', 549, 'Cakes', true, 'Rich dark chocolate cake'],
    ['Belgian Waffle', 199, 'Waffles', true, 'Waffle with chocolate sauce and ice cream'],
    ['Walnut Brownie', 129, 'Bakes', true, 'Fudgy brownie with walnuts'],
    ['Gelato Scoop', 99, 'Ice Cream', true, 'Choose from seasonal flavours'],
    ['Strawberry Milkshake', 139, 'Shakes', true, 'Fresh strawberries, milk and ice cream'],
  ],
  continental: [
    ['Grilled Chicken Steak', 499, 'Main Course', false, 'With mashed potato and pepper sauce'],
    ['Grilled Fish with Lemon Butter', 549, 'Main Course', false, 'Served with sautéed vegetables'],
    ['Mushroom Risotto', 399, 'Main Course', true, 'Creamy arborio rice with mushrooms'],
    ['Cream of Tomato Soup', 179, 'Soups', true, 'Slow-cooked tomato soup with croutons'],
    ['Bruschetta', 229, 'Starters', true, 'Toasted bread with tomato, basil and olive oil'],
    ['Chocolate Lava Cake', 249, 'Desserts', true, 'Warm cake with a molten centre'],
  ],
}

// Cuisine names that should use another cuisine's menu
const aliases = {
  mughlai: 'north indian', punjabi: 'north indian', hyderabadi: 'biryani', thai: 'chinese',
  pizza: 'italian', healthy: 'cafe', salads: 'cafe', sushi: 'japanese', burgers: 'american',
  goan: 'seafood', kerala: 'seafood', bakery: 'desserts',
}

export const sampleMenuFor = (restaurant) => {
  const keys = new Set()
  for (const cuisine of restaurant.cuisines || []) {
    const key = cuisine.toLowerCase()
    if (menus[key]) keys.add(key)
    else if (aliases[key]) keys.add(aliases[key])
  }
  if (keys.size === 0) keys.add('north indian')

  const seen = new Set()
  return [...keys].flatMap((key) => menus[key])
    .filter(([name]) => !seen.has(name) && seen.add(name))
    .map(([name, price, category, isVeg, description]) => ({
      restaurant: restaurant._id, name, price, category, isVeg, description,
    }))
}
