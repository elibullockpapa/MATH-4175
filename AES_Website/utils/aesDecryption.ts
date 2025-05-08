// AES_Website/utils/aesDecryption.ts
import { expandKey } from "./aesKeyExpansion";
import { SBOX, toHex, xtime } from "./aesCommon";

// -----
// Inverse S‑box (computed once at load‑time)
// -----
const INV_SBOX: number[] = (() => {
    const inv = new Array<number>(256);

    for (let i = 0; i < 256; i++) inv[SBOX[i]] = i;

    return inv;
})();

// -----
// GF(2^8) multiplication helpers needed for InvMixColumns
// -----
const mul2 = xtime;
const mul4 = (b: number) => mul2(mul2(b));
const mul8 = (b: number) => mul2(mul4(b));
const mul3 = (b: number) => mul2(b) ^ b;
const mul9 = (b: number) => mul8(b) ^ b; // 8 + 1
const mul11 = (b: number) => mul8(b) ^ mul2(b) ^ b; // 8 + 2 + 1
const mul13 = (b: number) => mul8(b) ^ mul4(b) ^ b; // 8 + 4 + 1
const mul14 = (b: number) => mul8(b) ^ mul4(b) ^ mul2(b); // 8 + 4 + 2

// -----
// Helper utilities
// -----
const toBytes = (hex: string) =>
    hex.match(/.{2}/g)!.map((h) => parseInt(h, 16));
const clone = (a: number[]) => a.slice();

const addRoundKey = (state: number[], rk: number[]) => {
    for (let i = 0; i < 16; i++) state[i] ^= rk[i];
};

// -----
// Inverse transformations
// -----
function invSubBytes(state: number[]) {
    for (let i = 0; i < 16; i++) state[i] = INV_SBOX[state[i]];
}

function invShiftRows(state: number[]) {
    const t = clone(state);

    // row = index % 4 ; shifts are to the RIGHT (reverse of encryption)
    state[1] = t[13];
    state[5] = t[1];
    state[9] = t[5];
    state[13] = t[9]; // shift 1

    state[2] = t[10];
    state[6] = t[14];
    state[10] = t[2];
    state[14] = t[6]; // shift 2

    state[3] = t[7];
    state[7] = t[11];
    state[11] = t[15];
    state[15] = t[3]; // shift 3
}

function invMixColumns(state: number[]) {
    for (let c = 0; c < 4; c++) {
        const i = 4 * c;
        const a0 = state[i],
            a1 = state[i + 1],
            a2 = state[i + 2],
            a3 = state[i + 3];

        state[i] = mul14(a0) ^ mul11(a1) ^ mul13(a2) ^ mul9(a3);
        state[i + 1] = mul9(a0) ^ mul14(a1) ^ mul11(a2) ^ mul13(a3);
        state[i + 2] = mul13(a0) ^ mul9(a1) ^ mul14(a2) ^ mul11(a3);
        state[i + 3] = mul11(a0) ^ mul13(a1) ^ mul9(a2) ^ mul14(a3);
    }
}

// -----
// Round‑key helper – identical to aesEncryption.ts but reversed order
// -----
function roundKeysBytes(keyHex: string): { rks: number[][]; Nr: number } {
    const { expandedKeyHex } = expandKey(keyHex);
    const expandedBytes = toBytes(expandedKeyHex);

    const keyNk = keyHex.length / 2 / 4; // words in original key
    let Nr = 0;

    if (keyNk === 4) Nr = 10;
    else if (keyNk === 6) Nr = 12;
    else if (keyNk === 8) Nr = 14;
    else throw new Error("Invalid key size for Nr determination.");

    const forward: number[][] = [];

    for (let i = 0; i <= Nr; i++) {
        forward.push(expandedBytes.slice(i * 16, (i + 1) * 16));
    }

    return { rks: forward.reverse(), Nr }; // reverse order for decryption
}

// -----
// Decrypt a single 16‑byte block
// -----
function decryptBlock(
    block: number[],
    rks: number[][],
    Nr: number,
    trace: string[],
): number[] {
    const state = clone(block);

    // 0) initial AddRoundKey (with last round‑key: rks[0] after reversal)
    addRoundKey(state, rks[0]);
    trace.push(`add round key (round ${Nr}):\t${toHex(state)}`);

    // 1‑(Nr‑1) rounds
    for (let round = 1; round < Nr; round++) {
        invShiftRows(state);
        trace.push(`invShiftRows:\t${toHex(state)}`);

        invSubBytes(state);
        trace.push(`invSubBytes:\t${toHex(state)}`);

        addRoundKey(state, rks[round]);
        trace.push(`round key ${Nr - round}:\t${toHex(state)}`);

        invMixColumns(state);
        trace.push(`invMixColumns:\t${toHex(state)}`);
    }

    // final round (no InvMixColumns)
    invShiftRows(state);
    trace.push(`invShiftRows:\t${toHex(state)}`);

    invSubBytes(state);
    trace.push(`invSubBytes:\t${toHex(state)}`);

    addRoundKey(state, rks[Nr]);
    trace.push(`round key 0:\t${toHex(state)}`);

    trace.push(`end of block:\t${toHex(state)}`);

    return state;
}

// -----
// Parent Function
// -----
export interface DecryptResult {
    plaintext: string; // hex
    trace: string; // multi‑line log
}

export function decryptAES(
    encryptedText: string,
    keyHex: string,
    useCBC = false,
    ivHex?: string, // optional custom IV (hex, 32 chars)
): DecryptResult {
    if (
        !/^[0-9a-fA-F]+$/.test(encryptedText) ||
        encryptedText.length % 32 !== 0
    )
        throw new Error(
            "Ciphertext must be hex and a multiple of 16 bytes (32 hex chars).",
        );

    const { rks, Nr } = roundKeysBytes(keyHex);

    const blocks = encryptedText.match(/.{32}/g)!;
    const iv = ivHex ? toBytes(ivHex) : new Array(16).fill(0);

    const traceLines: string[] = [];
    const plainBytes: number[] = [];

    let prevCipher = clone(iv);

    blocks.forEach((hex, index) => {
        const cipherBlock = toBytes(hex);

        const blockTrace: string[] = [];
        const decrypted = decryptBlock(cipherBlock, rks, Nr, blockTrace);

        let plainBlock = decrypted;

        if (useCBC) {
            plainBlock = clone(decrypted);
            for (let i = 0; i < 16; i++) plainBlock[i] ^= prevCipher[i];
            blockTrace.push(
                `CBC xor (IV${index === 0 ? "" : " = prevCipher"}):\t${toHex(
                    plainBlock,
                )}`,
            );
            prevCipher = cipherBlock; // update chain
        }

        traceLines.push(...blockTrace);
        plainBytes.push(...plainBlock);
    });

    return { plaintext: toHex(plainBytes), trace: traceLines.join("\n") };
}
