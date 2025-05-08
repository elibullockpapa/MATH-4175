# AES and Secrecy Questions

## Question 1
Pick any 16-byte plaintext and a 32-byte key. Encrypt your plaintext (since it contains only one block, it should not matter which mode you use.) This will be your baseline against which you make comparisons.

### Answer:
Plaintext (16 bytes - 32 hex characters): `aaaabbbbccccddddeeeeffff00001111`
Key (32 bytes - 64 hex characters): `0000111122223333444455556666777788889999aaaabbbbccccddddeeeeffff`
Encrypted Plaintext (16 bytes): `7b1156da4b7586cbf219ba99d2fe4ad2`

## Question 2
Alter **one bit** of your plaintext and encrypt it again. How many bits of the ciphertext were altered? (A fast way to do this is to XOR the two ciphertexts and count the 1's.)
*Ideally, about 50% of the bits should change—so that the odds of a bit changing and not changing are approximately equal.*

*This is testing that similar plaintexts can result in very different ciphertexts.*

### Answer:
Altered plaintext: `aaaabbbbccccddddeeeeffff01001111`
New encrypted plaintext: `8a1ebbc7747e7217d3a77e2f75b5d704`
Bits changed: 73 out of 128 (57.03%)

## Question 3
Does it matter where the plaintext is altered? That is, is the ciphertext more sensitive to changes near the beginning of a block, at the end of a block, or does it matter? This time, encode the plaintext, but with a different bit altered. How many bits of the ciphertext were altered?

### Answer:
Altered plaintext: `8aaabbbbccccddddeeeeffff00001111` (changed the first a to an 8)
New encrypted plaintext: `bb6b2e5cc5400b079bcfc2d9a4c3218f`
Bits changed: 64 out of 128 (50.00%)

## Question 4
Does it matter if the key is altered instead of the plaintext? Encrypt the plaintext you originally chose, but this time alter one bit of the key. Report how many bits of the ciphertext were altered.
*This is testing that similar keys should results in very different ciphertexts.*

### Answer:
Altered key: `1000111122223333444455556666777788889999aaaabbbbccccddddeeeeffff` (changed the first 0 to a 1)
New encrypted plaintext: `e50af245be43368f1f59b38566a52bd5`
Bits changed: 60 out of 128 (46.88%)

## Question 5
Does the initial key length matter? Truncate your key from 32 bytes to 24 bytes and encrypt your plaintext again. Report how many bits of the ciphertext were altered.

### Answer:
Truncated key (24 bytes - 48 hex characters): `0000111122223333444455556666777788889999aaaabbbb`
New encrypted plaintext: `1c5262e917b80d8e2363b48b139f5c75`
Bits changed: 59 out of 128 (46.09%)
