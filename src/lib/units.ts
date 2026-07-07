// Mirrors mobile's src/utils/helpers.ts convertToUserUnit/convertToKg so
// weight values are converted the same way on both platforms.

export function convertToUserUnit(
  weightStrOrNum: unknown,
  userUnit: string,
  defaultUnit: string = "lbs",
): string {
  if (weightStrOrNum === undefined || weightStrOrNum === null || String(weightStrOrNum).trim() === "") {
    return "";
  }
  const str = String(weightStrOrNum).trim();

  if (str.toLowerCase() === "bodyweight") {
    return "Bodyweight";
  }

  if (str.includes("%")) {
    return str;
  }

  const numMatch = str.match(/^([\d.]+)/);
  if (!numMatch) return str;

  const numVal = parseFloat(numMatch[1]);
  if (isNaN(numVal)) return str;

  let unit = defaultUnit.toLowerCase();
  if (str.toLowerCase().includes("kg")) {
    unit = "kg";
  } else if (str.toLowerCase().includes("lbs")) {
    unit = "lbs";
  }

  const targetUnit = (userUnit || "lbs").toLowerCase().trim();

  let convertedVal = numVal;
  if (unit === "lbs" && targetUnit === "kg") {
    convertedVal = numVal * 0.45359237;
  } else if (unit === "kg" && targetUnit === "lbs") {
    convertedVal = numVal / 0.45359237;
  }

  const roundedVal = Math.round(convertedVal);
  return `${roundedVal} ${targetUnit}`;
}

export function convertToKg(weightStrOrNum: unknown, defaultUnit: string = "lbs"): string {
  return convertToUserUnit(weightStrOrNum, "kg", defaultUnit);
}
