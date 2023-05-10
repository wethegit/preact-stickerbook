export function classnames(namesArray) {
  return namesArray
    .filter((v) => v != "")
    .join(" ")
    .trim();
}