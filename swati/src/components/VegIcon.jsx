// VegIcon: the green (veg) / red (non-veg) square mark used on Indian menus. Prop: isVeg.

// The standard Indian veg (green) / non-veg (red) square mark
const VegIcon = ({ isVeg }) => (
  <span
    className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border-2 ${isVeg ? 'border-green-700' : 'border-red-700'}`}
    title={isVeg ? 'Veg' : 'Non-veg'}
    aria-label={isVeg ? 'Veg' : 'Non-veg'}
  >
    <span className={`h-2 w-2 rounded-full ${isVeg ? 'bg-green-700' : 'bg-red-700'}`} />
  </span>
)

export default VegIcon
