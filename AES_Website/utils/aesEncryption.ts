// AES_Website/utils/aesEncryption.ts
import { expandKey } from "./aesKeyExpansion";
import { SBOX, toHex, xtime } from "./aesCommon";

// -----
// Multiplication helpers
// -----
const mul2 = xtime;
const mul3 = (b: number) => mul2(b) ^ b;

// -----
// State helpers (col‑major 4×4 matrix, AES standard)
// -----
const toBytes = (hex: string) =>
    hex.match(/.{2}/g)!.map((b) => parseInt(b, 16));

const clone = (arr: number[]) => arr.slice();

// -----
// Transformations
// -----
function subBytes(state: number[]) {
    for (let i = 0; i < 16; i++) state[i] = SBOX[state[i]];
}

function shiftRows(state: number[]) {
    const t = clone(state);

    // row == index % 4
    state[1] = t[5];
    state[5] = t[9];
    state[9] = t[13];
    state[13] = t[1]; // shift 1
    state[2] = t[10];
    state[6] = t[14];
    state[10] = t[2];
    state[14] = t[6]; // shift 2
    state[3] = t[15];
    state[7] = t[3];
    state[11] = t[7];
    state[15] = t[11]; // shift 3
}

function mixColumns(state: number[]) {
    for (let c = 0; c < 4; c++) {
        const i = 4 * c;
        const a0 = state[i],
            a1 = state[i + 1],
            a2 = state[i + 2],
            a3 = state[i + 3];

        state[i] = mul2(a0) ^ mul3(a1) ^ a2 ^ a3;
        state[i + 1] = a0 ^ mul2(a1) ^ mul3(a2) ^ a3;
        state[i + 2] = a0 ^ a1 ^ mul2(a2) ^ mul3(a3);
        state[i + 3] = mul3(a0) ^ a1 ^ a2 ^ mul2(a3);
    }
}

const addRoundKey = (state: number[], rk: number[]) => {
    for (let i = 0; i < 16; i++) state[i] ^= rk[i];
};

// -----
// Build round‑key byte arrays from the output of expandKey()
// -----
function roundKeysBytes(keyHex: string): { rks: number[][]; Nr: number } {
    // expandKey now returns { expandedKeyHex: string, trace: string }
    const { expandedKeyHex } = expandKey(keyHex);
    const expandedBytes = toBytes(expandedKeyHex); // Use existing toBytes helper

    const keyNk = keyHex.length / 2 / 4; // Original key length in words
    let Nr = 0;

    if (keyNk === 4)
        Nr = 10; // 128-bit key
    else if (keyNk === 6)
        Nr = 12; // 192-bit key
    else if (keyNk === 8)
        Nr = 14; // 256-bit key
    else
        throw new Error(
            "Invalid key size for Nr determination in roundKeysBytes.",
        );

    const rks: number[][] = [];

    for (let i = 0; i <= Nr; i++) {
        rks.push(expandedBytes.slice(i * 16, (i + 1) * 16));
    }

    return { rks, Nr };
}

// -----
// Encrypt a single 16‑byte block – returns [cipherBytes, traceLines]
// -----
function encryptBlock(
    block: number[],
    rks: number[][],
    Nr: number,
    trace: string[],
): number[] {
    const state = clone(block);

    // initial AddRoundKey
    addRoundKey(state, rks[0]);
    trace.push(`add round key:\t${toHex(state)}`);

    // main rounds
    for (let round = 1; round < Nr; round++) {
        subBytes(state);
        trace.push(`subBytes:\t${toHex(state)}`);
        shiftRows(state);
        trace.push(`shiftRows:\t${toHex(state)}`);
        mixColumns(state);
        trace.push(`mixColumns:\t${toHex(state)}`);
        addRoundKey(state, rks[round]); // Add key first
        trace.push(`round key ${round - 1}:\t${toHex(state)}`); // Then trace state
    }

    // final round (no MixColumns)
    subBytes(state);
    trace.push(`subBytes:\t${toHex(state)}`);
    shiftRows(state);
    trace.push(`shiftRows:\t${toHex(state)}`);
    addRoundKey(state, rks[Nr]); // Add key first
    trace.push(`round key ${Nr - 1}:\t${toHex(state)}`); // Then trace state

    trace.push(`end of block:\t${toHex(state)}`);

    return state;
}

// -----
// Parent function
// -----
export interface EncryptResult {
    ciphertext: string; // hex
    trace: string; // multi‑line log
}

export function encryptAES(
    plaintextHex: string,
    keyHex: string,
    useCBC = false,
    ivHex?: string, // optional custom IV (hex, 32 chars)
): EncryptResult {
    if (!/^[0-9a-fA-F]+$/.test(plaintextHex) || plaintextHex.length % 32 !== 0)
        throw new Error(
            "Plaintext must be hex and a multiple of 16 bytes (32 hex chars).",
        );

    const { rks, Nr } = roundKeysBytes(keyHex);

    const blocks = plaintextHex.match(/.{32}/g)!;
    const iv = ivHex ? toBytes(ivHex) : new Array(16).fill(0);

    const traceLines: string[] = [];
    const cipherBytes: number[] = [];

    let prev = clone(iv);

    blocks.forEach((hex, index) => {
        let block = toBytes(hex);

        if (useCBC) {
            for (let i = 0; i < 16; i++) block[i] ^= prev[i];
            traceLines.push(
                `CBC xor (IV${index === 0 ? "" : " = prevCipher"}):\t${toHex(block)}`,
            );
        }

        const blockTrace: string[] = [];
        const encrypted = encryptBlock(block, rks, Nr, blockTrace);

        traceLines.push(...blockTrace);

        cipherBytes.push(...encrypted);
        prev = encrypted; // for CBC
    });

    return { ciphertext: toHex(cipherBytes), trace: traceLines.join("\n") };
}
