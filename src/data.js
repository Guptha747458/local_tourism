import { MapPin, Utensils, Waves, TreePine, Sparkles } from 'lucide-react';

export const CATEGORIES = [
  { name: "All Spots", icon: Sparkles, value: "All", colorClass: "icon-indigo" },
  { name: "Landmarks", icon: MapPin, value: "Landmarks", colorClass: "icon-yellow" },
  { name: "Beaches", icon: Waves, value: "Beaches", colorClass: "icon-blue" },
  { name: "Cuisine", icon: Utensils, value: "Cuisine", colorClass: "icon-red" },
  { name: "Nature", icon: TreePine, value: "Nature", colorClass: "icon-green" },
];

export const AZURE_COAST_SPOTS = [
  {
    id: 1,
    name: "Vizag Lighthouse",
    category: "Landmarks",
    description: "A historic 19th-century lighthouse offering breathtaking panoramic views of the entire coast. A must-see at sunset.",
    rating: 4.8,
    imagePlaceholder: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Lighthouse_on_Visakhapatnam_beach_road.jpg",
    details: "Built in 1888, the lighthouse is still operational and houses a small maritime museum on the ground floor. Wear comfortable shoes for the climb! A lighthouse is a tower, building, or other type of physical structure designed to emit light from a system of lamps and lenses and to serve as a beacon for navigational aid for maritime pilots at sea or on inland waterways.",
  },
  {
    id: 2,
    name: "Driftwood Beach",
    category: "Beaches",
    description: "Known for its unique collection of sun-bleached driftwood, this quiet beach is perfect for photography and relaxing walks.",
    rating: 4.5,
    imagePlaceholder: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/10/d5/fc/this-place-is-amazing.jpg?w=1400&h=800&s=1",
    details: "The currents often bring interesting pieces of wood and shells. It's less crowded than the main beach and ideal for a serene morning.",
  },
  {
    id: 3,
    name: "The Deep Dive Bistro",
    category: "Cuisine",
    description: "A local favorite specializing in fresh seafood, famous for its clam chowder and oceanfront dining experience.",
    rating: 4.9,
    imagePlaceholder: "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_640,ar_4:3,g_center,f_auto/cms/reviews/deep-dive/banners/1541444386.99",
    details: "Reservations are highly recommended, especially on weekends. Try the signature 'Azure Platter' for a taste of everything!",
  },
  {
    id: 4,
    name: "Pine Bluff Trail",
    category: "Nature",
    description: "A moderately challenging 5-mile loop through dense pine forest, leading to a stunning clifftop overlook.",
    rating: 4.7,
    imagePlaceholder: "https://i0.wp.com/on-walkabout.net/wp-content/uploads/2019/08/Screen-Shot-2019-08-24-at-7.19.25-PM.png?resize=1024%2C509&ssl=1",
    details: "The trail entrance has ample parking. Bring water and watch out for local wildlife. Best visited during spring bloom.",
  },
  {
    id: 5,
    name: "Old Town Market Square",
    category: "Landmarks",
    description: "The historic heart of Azure Coast, featuring colonial architecture and weekly artisan stalls.",
    rating: 4.6,
    imagePlaceholder: "https://www.museuly.com/wp-content/uploads/2018/08/Old-Town-Market-Square_photo-F.-Kwiatkowski%C2%A9Warsaw-Tourist-Office.jpg",
    details: "The market runs every Saturday morning. Look for the famous lavender honey from a local farm.",
  },
  {
    id: 6,
    name: "Sunken Shipwreck Cove",
    category: "Beaches",
    description: "A popular spot for snorkeling and diving, featuring the visible remains of a 1920s freighter near the shore.",
    rating: 4.4,
    imagePlaceholder: "https://th.bing.com/th/id/R.7b6303ca64980a9eec91f4f67fcf7e90?rik=AdGoWLFnzYUcOg&riu=http%3a%2f%2f4.bp.blogspot.com%2f-i9JNJJXMxsw%2fT9sTcgL0quI%2fAAAAAAAABPo%2f4AQ1rep2nHI%2fs1600%2fP1000926.jpg&ehk=6LunE9L6OLz1H848Lh7SAbykp7PG%2fHFA%2bcue7%2bxVlfY%3d&risl=&pid=ImgRaw&r=0",
    details: "Gear rental is available nearby. The water is clearest in the early morning. Be mindful of strong currents further out.",
  },
  {
    id: 7,
    name: "The Spice Merchant",
    category: "Cuisine",
    description: "An exotic fusion restaurant offering highly-rated vegetarian and vegan options with unique flavor profiles.",
    rating: 4.3,
    imagePlaceholder: "https://media-cdn.tripadvisor.com/media/photo-s/19/aa/c5/b9/the-spice-merchant-front.jpg",
    details: "A tasty meal prepared with fresh vegetables and choice cuts of meat. Known for their curried pumpkin soup and extensive tea selection. Located just off the main high street.",
  }
];