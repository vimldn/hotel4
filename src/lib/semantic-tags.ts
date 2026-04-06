export interface SemanticTag {
  id: string
  label: string
  category: string
}

export const SEMANTIC_TAGS: SemanticTag[] = [
  // Fitness
  { id: 'squat_rack',      label: 'Squat rack in gym',        category: 'Fitness' },
  { id: 'lap_pool',        label: 'Lap swimming pool',        category: 'Fitness' },
  { id: 'sauna',           label: 'Sauna or steam room',      category: 'Fitness' },
  { id: 'peloton',         label: 'Peloton / spin bike',      category: 'Fitness' },
  // Work
  { id: '4k_monitor',      label: '4K monitor in room',       category: 'Work' },
  { id: 'fast_wifi',       label: 'Fast WiFi (500+ Mbps)',    category: 'Work' },
  { id: 'standing_desk',   label: 'Standing desk',            category: 'Work' },
  { id: 'meeting_room',    label: 'Private meeting room',     category: 'Work' },
  // Sleep
  { id: 'quiet_floor',     label: 'Quiet floor',              category: 'Sleep' },
  { id: 'blackout',        label: 'Blackout curtains',        category: 'Sleep' },
  { id: 'no_connecting',   label: 'Non-connecting room',      category: 'Sleep' },
  // Room
  { id: 'bathtub',         label: 'Full bathtub',             category: 'Room' },
  { id: 'high_floor',      label: 'High floor with view',     category: 'Room' },
  { id: 'no_carpet',       label: 'Hardwood / tile floor',    category: 'Room' },
  { id: 'natural_light',   label: 'Abundant natural light',   category: 'Room' },
  // Food
  { id: 'gluten_free',     label: 'Gluten-free breakfast',    category: 'Food' },
  { id: 'vegan',           label: 'Vegan breakfast',          category: 'Food' },
  { id: 'espresso',        label: 'In-room espresso machine', category: 'Food' },
  // Access
  { id: 'late_checkout',   label: 'Late checkout (2pm+)',     category: 'Access' },
  { id: 'early_checkin',   label: 'Early check-in',           category: 'Access' },
  { id: 'parking',         label: 'Parking included',         category: 'Access' },
  { id: 'ev_charging',     label: 'EV charging',              category: 'Access' },
  // Vibe
  { id: 'minimalist',      label: 'Minimalist / design-led',  category: 'Vibe' },
  { id: 'boutique',        label: 'Boutique / independent',   category: 'Vibe' },
  { id: 'pet_friendly',    label: 'Pet friendly',             category: 'Vibe' },
]

export const TAGS_BY_CATEGORY = SEMANTIC_TAGS.reduce<Record<string, SemanticTag[]>>(
  (acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = []
    acc[tag.category].push(tag)
    return acc
  },
  {}
)

export const TAG_LABEL: Record<string, string> = Object.fromEntries(
  SEMANTIC_TAGS.map((t) => [t.id, t.label])
)
