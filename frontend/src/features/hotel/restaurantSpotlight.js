import { UtensilsCrossed, Wine, Coffee } from 'lucide-react'

export const RESTAURANT_FEATURE_ICONS = {
  food: UtensilsCrossed,
  drinks: Wine,
  coffee: Coffee,
}

export const DEFAULT_RESTAURANT_FEATURES = [
  { icon: 'food', title: 'Full kitchen', text: 'Cook together — the apartment has a kitchen for your group.' },
  { icon: 'drinks', title: 'Private bar', text: 'The bar is for people staying in the villa, not walk-in hotel guests.' },
  { icon: 'coffee', title: 'Breakfast optional', text: '$150 a night without breakfast, $200 with breakfast for the whole apartment.' },
]
