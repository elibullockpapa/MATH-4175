// AES_Website/utils/testCases.ts
export const aesTestCases = [
    {
        key: "test1",
        label: "Test Case 1",
        plaintextFile: "/test_files/aes-plaintext1.txt",
        keyFile: "/test_files/aes-key1.txt",
        ecbCiphertextFile: "/test_files/aes-ciphertext1-ecb.txt",
        cbcCiphertextFile: "/test_files/aes-ciphertext1-cbc.txt",
    },
    {
        key: "test2",
        label: "Test Case 2",
        plaintextFile: "/test_files/aes-plaintext2.txt",
        keyFile: "/test_files/aes-key2.txt",
        ecbCiphertextFile: "/test_files/aes-ciphertext2-ecb.txt",
        cbcCiphertextFile: "/test_files/aes-ciphertext2-cbc.txt",
    },
    {
        key: "test3",
        label: "Test Case 3",
        plaintextFile: "/test_files/aes-plaintext3.txt",
        keyFile: "/test_files/aes-key3.txt",
        ecbCiphertextFile: "/test_files/aes-ciphertext3-ecb.txt",
        cbcCiphertextFile: "/test_files/aes-ciphertext3-cbc.txt",
    },
    {
        key: "test4",
        label: "Test Case 4",
        plaintextFile: "/test_files/aes-plaintext4.txt",
        keyFile: "/test_files/aes-key4.txt",
        ecbCiphertextFile: "/test_files/aes-ciphertext4-ecb.txt",
        cbcCiphertextFile: "/test_files/aes-ciphertext4-cbc.txt",
    },
    {
        key: "test5",
        label: "Test Case 5",
        plaintextFile: "/test_files/aes-plaintext5.txt",
        keyFile: "/test_files/aes-key5.txt",
        ecbCiphertextFile: "/test_files/aes-ciphertext5-ecb.txt",
        cbcCiphertextFile: "/test_files/aes-ciphertext5-cbc.txt",
    },
    {
        key: "test6",
        label: "Test Case 6",
        plaintextFile: "/test_files/aes-plaintext6.txt",
        keyFile: "/test_files/aes-key6.txt",
        ecbCiphertextFile: "/test_files/aes-ciphertext6-ecb.txt",
        cbcCiphertextFile: "/test_files/aes-ciphertext6-cbc.txt",
    },
    {
        key: "test7",
        label: "Test Case 7",
        plaintextFile: "/test_files/aes-plaintext7.txt",
        keyFile: "/test_files/aes-key7.txt",
        ecbCiphertextFile: "/test_files/aes-ciphertext7-ecb.txt",
        cbcCiphertextFile: "/test_files/aes-ciphertext7-cbc.txt",
    },
    {
        key: "test8",
        label: "Test Case 8",
        plaintextFile: "/test_files/aes-plaintext8.txt",
        keyFile: "/test_files/aes-key8.txt",
        ecbCiphertextFile: "/test_files/aes-ciphertext8-ecb.txt",
        cbcCiphertextFile: "/test_files/aes-ciphertext8-cbc.txt",
    },
    {
        key: "test9",
        label: "Test Case 9",
        plaintextFile: "/test_files/aes-plaintext9.txt",
        keyFile: "/test_files/aes-key9.txt",
        ecbCiphertextFile: "/test_files/aes-ciphertext9-ecb.txt",
        cbcCiphertextFile: "/test_files/aes-ciphertext9-cbc.txt",
    },
    {
        key: "test10",
        label: "Test Case 10 (decrypt only in CBC mode)",
        plaintextFile: "", // No plaintext file - can only be decrypted
        keyFile: "/test_files/aes-key10.txt",
        ecbCiphertextFile: "", // No ECB ciphertext file
        cbcCiphertextFile: "/test_files/aes-ciphertext10-cbc.txt",
    },
    {
        key: "test11",
        label: "Test Case 11 (encrypt only)",
        plaintextFile: "/test_files/aes-plaintext11.txt",
        keyFile: "/test_files/aes-key11.txt",
        ecbCiphertextFile: "", // No ciphertext file yet
        cbcCiphertextFile: "", // No ciphertext file yet
    },
    {
        key: "test12",
        label: "Test Case 12 (encrypt only)",
        plaintextFile: "/test_files/aes-plaintext12.txt",
        keyFile: "/test_files/aes-key12.txt",
        ecbCiphertextFile: "", // No ciphertext file yet
        cbcCiphertextFile: "", // No ciphertext file yet
    },
    {
        key: "test13",
        label: "Test Case 13 (encrypt only)",
        plaintextFile: "/test_files/aes-plaintext13.txt",
        keyFile: "/test_files/aes-key13.txt",
        ecbCiphertextFile: "", // No ciphertext file yet
        cbcCiphertextFile: "", // No ciphertext file yet
    },
];
