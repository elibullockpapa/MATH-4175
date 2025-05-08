// AES_Website/utils/aesKeyExpansion.ts
import { SBOX, toHex, xtime } from "./aesCommon"; // Import SBOX, toHex, and xtime

// -----
// Key expansion helpers
// -----

// (b0,b1,b2,b3) => (b1,b2,b3,b0)
function RotateLeft(bytes: number[]): number[] {
    return [bytes[1], bytes[2], bytes[3], bytes[0]];
}

// SubBytes applies S‑box to each byte (in‑place).
function SubBytes(bytes: number[]): number[] {
    return bytes.map((b) => SBOX[b]);
}

// AddRoundConstant XORs the first byte with Rcon for this round.
function AddRoundConstant(bytes: number[], round: number): number[] {
    // Rcon[round] implemented via xtimes‑chain per pdf
    let rcon = 0x01;

    for (let i = 1; i < round; i++) rcon = xtime(rcon); // Use imported xtime
    bytes[0] ^= rcon; // only MSB differs; others remain the same

    return bytes;
}

// -----
// Key expansion core and variants
// -----
function KeyExpansionCore(
    temp: number[],
    round: number,
    trace: string[],
): number[] {
    trace.push(`CORE round: ${round}`);
    trace.push(
        `input:\t${temp.map((b) => b.toString(16).padStart(2, "0")).join(" ")}`,
    );

    temp = RotateLeft(temp);
    trace.push(
        `Rotate Left:\t${temp.map((b) => b.toString(16).padStart(2, "0")).join(" ")}`,
    );

    temp = SubBytes(temp);
    trace.push(
        `SubBytes:\t${temp.map((b) => b.toString(16).padStart(2, "0")).join(" ")}`,
    );

    temp = AddRoundConstant(temp, round + 1); // pdf rounds start at 1
    trace.push(
        `AddRoundConstant:\t${temp.map((b) => b.toString(16).padStart(2, "0")).join(" ")}`,
    );

    return temp;
}

// -----
// Key‑expansion variants (128/192/256)
// -----

function expand128(initKey: number[], trace: string[]): number[] {
    const EK: number[] = [...initKey];
    let round = 0;

    while (EK.length < 176) {
        // 11 × 16‑byte keys
        for (let j = 0; j < 4; j++) {
            let temp1 = EK.slice(-4);

            if (j === 0) temp1 = KeyExpansionCore(temp1, round, trace);
            const temp2 = EK.slice(-16).slice(0, 4);
            const newWord = temp1.map((b, i) => b ^ temp2[i]);

            trace.push(
                `${j === 0 ? "XOR with temp2" : "temp1 XOR temp2"}:\t${newWord.map((b) => b.toString(16).padStart(2, "0")).join(" ")}`,
            );
            EK.push(...newWord);
        }
        round++;
    }

    return EK;
}

function expand192(initKey: number[], trace: string[]): number[] {
    const EK: number[] = [...initKey];
    let round = 0;

    while (EK.length < 208) {
        for (let j = 0; j < 6; j++) {
            let temp1 = EK.slice(-4);

            if (j === 0) temp1 = KeyExpansionCore(temp1, round, trace);
            const temp2 = EK.slice(-24).slice(0, 4);
            const newWord = temp1.map((b, i) => b ^ temp2[i]);

            trace.push(
                `${j === 0 ? "XOR with temp2" : "temp1 XOR temp2"}:\t${newWord.map((b) => b.toString(16).padStart(2, "0")).join(" ")}`,
            );
            EK.push(...newWord);
        }
        round++;
    }

    return EK;
}

function expand256(initKey: number[], trace: string[]): number[] {
    const EK: number[] = [...initKey];
    let round = 0;

    while (EK.length < 240) {
        for (let j = 0; j < 8; j++) {
            let temp1 = EK.slice(-4);

            if (j === 0) temp1 = KeyExpansionCore(temp1, round, trace);
            if (j === 4) temp1 = SubBytes(temp1); // extra SubBytes step
            const temp2 = EK.slice(-32).slice(0, 4);
            const newWord = temp1.map((b, i) => b ^ temp2[i]);

            trace.push(
                `${j === 0 ? "XOR with temp2" : "temp1 XOR temp2"}:\t${newWord.map((b) => b.toString(16).padStart(2, "0")).join(" ")}`,
            );
            EK.push(...newWord);
        }
        round++;
    }

    return EK;
}

// -----
// Parent function
// -----

export interface ExpansionResult {
    expandedKeyHex: string; // concatenated hex string (no spaces)
    trace: string; // multi‑line log: "CORE round: …"
}

export function expandKey(hexKey: string): ExpansionResult {
    if (!/^[0-9a-fA-F]+$/.test(hexKey))
        throw new Error("Key must be hexadecimal.");
    const keyBytes = hexKey.match(/.{2}/g)!.map((h) => parseInt(h, 16));

    const trace: string[] = [];
    let expanded: number[];

    switch (keyBytes.length) {
        case 16:
            expanded = expand128(keyBytes, trace);
            break;
        case 24:
            expanded = expand192(keyBytes, trace);
            break;
        case 32:
            expanded = expand256(keyBytes, trace);
            break;
        default:
            throw new Error("Key must be 128, 192, or 256 bits.");
    }

    // Format with a new line every 32 characters
    const expandedHex = toHex(expanded);
    const expandedKeyHex =
        expandedHex.match(/.{1,32}/g)?.join("\n") || expandedHex;

    return { expandedKeyHex, trace: trace.join("\n") };
}
