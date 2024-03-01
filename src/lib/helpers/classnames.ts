export function classnames(namesArray: (string | null | undefined)[]): string {
  return namesArray
    .filter((v) => typeof v === "string" && v !== "")
    .join(" ")
    .trim()
}
