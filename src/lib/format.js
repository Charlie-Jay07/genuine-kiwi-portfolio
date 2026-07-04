export function toTitle(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}


export function cleanDisplayName(value = "") {
  return String(value)
    .replace(/^_+/, "")
    .replace(/_+/g, "_");
}
