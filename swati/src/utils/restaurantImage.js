// restaurantImage(restaurant): the photo to show for a restaurant.
// 1. If the admin uploaded a photo (or gave an image URL), use it.
// 2. Otherwise pick the home-page food photo that matches its cuisine
//    (Biryani → biryani photo, Pizza → pizza photo, ...).
// 3. No match → one of the food photos, always the same one for the same restaurant.

import { foodMenu } from '../assets/fork-flame-static (11)/assets'

// cuisine word → title of the matching dish photo in assets.js
const photoForCuisine = {
  biryani: 'Mutton Biryani', hyderabadi: 'Mutton Biryani',
  pizza: 'Margherita Pizza', italian: 'Margherita Pizza',
  burgers: 'Chicken Burger', american: 'Chicken Burger',
  chinese: 'Hakka Noodles', thai: 'Hakka Noodles',
  punjabi: 'Tandoori Chicken', mughlai: 'Tandoori Chicken', 'north indian': 'Paneer Tikka',
  'south indian': 'Punjabi Samosa',
  cafe: 'Cold Coffee', healthy: 'Caesar Salad', salads: 'Caesar Salad',
  desserts: 'Red Velvet Cake', bakery: 'Red Velvet Cake',
  seafood: 'Grilled Fish', goan: 'Grilled Fish', kerala: 'Grilled Fish', japanese: 'Grilled Fish', sushi: 'Grilled Fish',
  continental: 'White Sauce Pasta',
}

export const restaurantImage = (restaurant) => {
  if (restaurant.image) return restaurant.image
  for (const cuisine of restaurant.cuisines || []) {
    const title = photoForCuisine[cuisine.toLowerCase()]
    const dish = title && foodMenu.find((d) => d.title === title)
    if (dish) return dish.image
  }
  const seed = [...restaurant._id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return foodMenu[seed % foodMenu.length].image
}
