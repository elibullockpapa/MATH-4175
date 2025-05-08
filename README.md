# MATH-4175
Cryptography with Hart, Heath D

## AES Website

### Setup
1. Navigate to the AES_Website directory:
   ```
   cd AES_Website
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and load the website.

### Usage
- **Text Input**: Simply type text into the field. Or, upload a txt file by pressing the upload button.
- **Mode Selection**: Press the checkbox to use CBC mode. Otherwise, it defaults to ECB mode.
- **Test Cases**: Compare the calculated output against test cases by loading one of the 9 provided test files from the test_files directory. These files were downloaded from [College Math](https://collegemath.org/cryptography/index.php/aes-test-files-deliverable-files/).
- **Download Output**: Download output files by clicking the download button next to where the output text is displayed (ciphertext, decrypted plaintext, computation traces, etc.).

### Implementation Files
The core AES implementation is contained in the following files:
- [aesCommon.ts](https://github.com/elibullockpapa/MATH-4175/blob/main/AES_Website/utils/aesCommon.ts) - Common constants and helper functions for AES operations.
- [aesEncryption.ts](https://github.com/elibullockpapa/MATH-4175/blob/main/AES_Website/utils/aesEncryption.ts) - AES encryption implementation with ECB and CBC modes.
- [aesDecryption.ts](https://github.com/elibullockpapa/MATH-4175/blob/main/AES_Website/utils/aesDecryption.ts) - AES decryption implementation with inverse transformations.
- [aesKeyExpansion.ts](https://github.com/elibullockpapa/MATH-4175/blob/main/AES_Website/utils/aesKeyExpansion.ts) - Key expansion for 128, 192, and 256-bit keys.

### Credits
UI components used in this project are from [HeroUI](https://www.heroui.com/).
