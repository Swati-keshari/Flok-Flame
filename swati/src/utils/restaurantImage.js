// restaurantImage(restaurant): the photo to show for a restaurant.
// If the admin didn't give an image URL, pick one of the home page food photos.
// The same restaurant always gets the same photo (chosen from its id).

import { foodMenu } from '../assets/fork-flame-static (11)/assets'

// Restaurants without their own photo get one of the menu images
export const restaurantImage = (restaurant) => {
  if (restaurant.image) return restaurant.image
  const seed = [...restaurant._id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return foodMenu[seed % foodMenu.length].image
}
