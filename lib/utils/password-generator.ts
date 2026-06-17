const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGIT = "0123456789";
const SPECIAL = "!@#$%^&*()_-+=?";

function pickOne(chars: string): string {
  const arr = new Uint32Array(1);
  if (typeof window !== "undefined") {
    crypto.getRandomValues(arr);
  } else {
    arr[0] = Math.floor(Math.random() * 2 ** 32);
  }
  return chars[arr[0] % chars.length];
}

function shuffle(input: string): string {
  const arr = input.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const r = new Uint32Array(1);
    if (typeof window !== "undefined") {
      crypto.getRandomValues(r);
    } else {
      r[0] = Math.floor(Math.random() * 2 ** 32);
    }
    const j = r[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

export function generatePassword(length: number = 12): string {
  const pool = UPPER + LOWER + DIGIT + SPECIAL;
  const required = [
    pickOne(UPPER),
    pickOne(LOWER),
    pickOne(DIGIT),
    pickOne(SPECIAL),
  ];
  const remaining: string[] = [];
  for (let i = 0; i < length - required.length; i++) {
    remaining.push(pickOne(pool));
  }
  return shuffle([...required, ...remaining].join(""));
}
