// AES_Website/components/Decryption.tsx
"use client";
import { useState, useRef, ChangeEvent } from "react";
import {
    Button,
    Input,
    Textarea,
    Chip,
    Checkbox,
    Select,
    SelectItem,
} from "@heroui/react";

import { decryptAES } from "../utils/aesDecryption";
import { aesTestCases } from "../utils/testCases";
import {
    validateHexKey,
    fetchCleanFileContent,
    readFileContent,
    createFileInputHelpers,
} from "../utils/aesFormUtils";

import { UploadIcon, DownloadIcon } from "@/components/icons";

export default function Decryption() {
    const [textToDecrypt, setTextToDecrypt] = useState("");
    const [key, setKey] = useState("");
    const [useCBC, setUseCBC] = useState(false);
    const [error, setError] = useState("");
    const [decryptedText, setDecryptedText] = useState("");
    const [decryptionTrace, setDecryptionTrace] = useState("");
    const [selectedTestCaseKey, setSelectedTestCaseKey] = useState<
        string | null
    >(null);
    const [comparisonResult, setComparisonResult] = useState<string | null>(
        null,
    );
    const textFileInputRef = useRef<HTMLInputElement>(null);
    const keyFileInputRef = useRef<HTMLInputElement>(null);

    // Handle Test Case Selection
    const handleTestCaseSelection = async (tcKey: string | null) => {
        setSelectedTestCaseKey(tcKey);
        setComparisonResult(null);
        setDecryptedText("");
        setDecryptionTrace("");
        setError("");

        if (tcKey) {
            const testCase = aesTestCases.find((tc) => tc.key === tcKey);

            if (testCase) {
                try {
                    const ciphertextFile = useCBC
                        ? testCase.cbcCiphertextFile
                        : testCase.ecbCiphertextFile;

                    // Check if there's a ciphertext file for the current mode
                    if (!ciphertextFile) {
                        setError(
                            `No ciphertext file available for ${useCBC ? "CBC" : "ECB"} mode`,
                        );
                        setSelectedTestCaseKey(null);

                        return;
                    }

                    const cipherText =
                        await fetchCleanFileContent(ciphertextFile);
                    const keyValue = await fetchCleanFileContent(
                        testCase.keyFile,
                    );

                    setTextToDecrypt(cipherText);
                    setKey(keyValue);
                } catch (err: any) {
                    setError(`Error loading test case: ${err.message}`);
                    setTextToDecrypt(""); // Clear fields on error
                    setKey("");
                    setSelectedTestCaseKey(null); // Deselect on error
                }
            }
        }
    };

    // Handle text input change
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTextToDecrypt(e.target.value);
        setSelectedTestCaseKey(null); // Deselect test case on manual input
        setComparisonResult(null);
    };

    // Handle key input change
    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKey(e.target.value);
        setSelectedTestCaseKey(null); // Deselect test case on manual input
        setComparisonResult(null);
    };

    // Handle text file upload
    const handleTextFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            readFileContent(file, (value) => {
                setTextToDecrypt(value);
                setSelectedTestCaseKey(null); // Deselect test case on file upload
                setComparisonResult(null);
            });
        }
    };

    // Handle key file upload
    const handleKeyFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            readFileContent(file, (value) => {
                setKey(value);
                setSelectedTestCaseKey(null); // Deselect test case on file upload
                setComparisonResult(null);
            });
        }
    };

    // Create file input helpers
    const {
        triggerFileUpload: triggerTextFileUpload,
        fileInputProps: textFileInputProps,
    } = createFileInputHelpers(textFileInputRef, handleTextFileUpload);

    const {
        triggerFileUpload: triggerKeyFileUpload,
        fileInputProps: keyFileInputProps,
    } = createFileInputHelpers(keyFileInputRef, handleKeyFileUpload);

    // Handle download for decrypted text
    const handleDownloadDecryptedText = () => {
        if (!decryptedText) return;

        const blob = new Blob([decryptedText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        // Create a name for the file based on test case if selected
        let filename = "decrypted_text.txt";

        if (selectedTestCaseKey) {
            const testNumber = selectedTestCaseKey.replace("test", "");

            filename = `aes-plaintext${testNumber}.txt`;
        }

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Handle download for decryption trace
    const handleDownloadDecryptionTrace = () => {
        if (!decryptionTrace) return;

        const blob = new Blob([decryptionTrace], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        // Create a name for the file based on test case if selected
        let filename = "decryption_trace.txt";

        if (selectedTestCaseKey) {
            const testNumber = selectedTestCaseKey.replace("test", "");
            const mode = useCBC ? "cbc" : "ecb";

            filename = `aes-decryption-trace${testNumber}-${mode}.txt`;
        }

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Handle decryption
    const handleDecrypt = async () => {
        try {
            if (!textToDecrypt) {
                setError("Text to decrypt cannot be empty");

                return;
            }

            if (!validateHexKey(key, setError)) {
                return;
            }

            // Use the AES decryption utility
            const { plaintext, trace } = decryptAES(textToDecrypt, key, useCBC);

            setDecryptedText(plaintext);
            setDecryptionTrace(trace);
            setError("");

            // Perform comparison if a test case is selected
            if (selectedTestCaseKey) {
                const testCase = aesTestCases.find(
                    (tc) => tc.key === selectedTestCaseKey,
                );

                if (testCase) {
                    const expectedPlaintext = await fetchCleanFileContent(
                        testCase.plaintextFile,
                    );

                    // Directly compare the plaintext
                    if (plaintext === expectedPlaintext) {
                        setComparisonResult("Match!");
                    } else {
                        setComparisonResult(
                            `Mismatch! Expected: ${expectedPlaintext}, Got: ${plaintext}`,
                        );
                    }
                }
            } else {
                setComparisonResult(null); // Clear comparison if no test case active
            }
        } catch (err: any) {
            setError(err.message);
            setComparisonResult(null); // Clear on general decryption error too
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">AES Decryption</h3>

            {/* Test Case Selector */}
            <div className="flex flex-col gap-2">
                <Select
                    label="Select a Test Case (Optional)"
                    placeholder="Load data from a test case"
                    selectedKeys={
                        selectedTestCaseKey ? [selectedTestCaseKey] : []
                    }
                    onSelectionChange={(keys) => {
                        const newKey = Array.from(keys)[0] as string;

                        handleTestCaseSelection(newKey || null);
                    }}
                >
                    {aesTestCases
                        .filter((tc) => {
                            // Only include test cases that have ciphertext files
                            const hasEcbCiphertext = !!tc.ecbCiphertextFile;
                            const hasCbcCiphertext = !!tc.cbcCiphertextFile;

                            return hasEcbCiphertext || hasCbcCiphertext;
                        })
                        .map((tc) => (
                            <SelectItem key={tc.key}>{tc.label}</SelectItem>
                        ))}
                </Select>
            </div>

            {/* Text to decrypt input */}
            <div className="flex flex-col gap-2">
                <div className="flex w-full gap-2">
                    <Input
                        className="flex-grow"
                        label="Text to decrypt (Hex)"
                        placeholder="Enter ciphertext to decrypt..."
                        value={textToDecrypt}
                        onChange={handleTextChange}
                    />
                    <Button
                        isIconOnly
                        className="self-end h-14 w-14"
                        size="sm"
                        startContent={<UploadIcon size={24} />}
                        variant="flat"
                        onPress={triggerTextFileUpload}
                    />
                    <input {...textFileInputProps} />
                </div>
            </div>

            {/* Key input */}
            <div className="flex flex-col gap-2">
                <div className="flex w-full gap-2">
                    <Input
                        className="flex-grow"
                        label="Initial Key (Hex)"
                        placeholder="Enter hexadecimal key..."
                        value={key}
                        onChange={handleKeyChange}
                    />
                    <Button
                        isIconOnly
                        className="self-end h-14 w-14"
                        size="sm"
                        startContent={<UploadIcon size={24} />}
                        variant="flat"
                        onPress={triggerKeyFileUpload}
                    />
                    <input {...keyFileInputProps} />
                </div>
                <span className="text-sm text-gray-500">
                    Expected format: 32, 48, or 64 hexadecimal characters (128,
                    192, or 256-bit key)
                </span>
            </div>

            {/* CBC checkbox */}
            <div className="flex items-center gap-2">
                <Checkbox
                    isSelected={useCBC}
                    onValueChange={(isSelected) => {
                        setUseCBC(isSelected);

                        // If a test case is selected, check if it has a ciphertext file for the new mode
                        if (selectedTestCaseKey) {
                            const testCase = aesTestCases.find(
                                (tc) => tc.key === selectedTestCaseKey,
                            );

                            if (testCase) {
                                const ciphertextFile = isSelected
                                    ? testCase.cbcCiphertextFile
                                    : testCase.ecbCiphertextFile;

                                if (!ciphertextFile) {
                                    setError(
                                        `No ciphertext file available for ${isSelected ? "CBC" : "ECB"} mode`,
                                    );
                                    setSelectedTestCaseKey(null);
                                } else {
                                    // If changing modes with a valid test case, reload the test case
                                    handleTestCaseSelection(
                                        selectedTestCaseKey,
                                    );

                                    return;
                                }
                            }
                        }

                        // Default behavior if no test case or test case was cleared
                        setComparisonResult(null);
                    }}
                >
                    Use CBC mode
                </Checkbox>
            </div>

            {/* Error display */}
            {error && (
                <Chip color="danger" variant="flat">
                    {error}
                </Chip>
            )}

            {/* Decrypt button */}
            <Button color="primary" onPress={handleDecrypt}>
                Decrypt
            </Button>

            {/* Display decrypted result */}
            {decryptedText && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">
                            Decrypted Text:
                        </h3>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={handleDownloadDecryptedText}
                        >
                            <DownloadIcon size={20} />
                        </Button>
                    </div>
                    <Textarea
                        readOnly
                        className="font-mono"
                        rows={3}
                        value={decryptedText}
                    />
                </div>
            )}

            {/* Display decryption trace */}
            {decryptionTrace && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">
                            Decryption Trace:
                        </h3>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={handleDownloadDecryptionTrace}
                        >
                            <DownloadIcon size={20} />
                        </Button>
                    </div>
                    <Textarea
                        readOnly
                        className="font-mono"
                        rows={10}
                        value={decryptionTrace}
                    />
                </div>
            )}

            {/* Display comparison result */}
            {comparisonResult && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">
                        Test Case Comparison:
                    </h3>
                    <Chip
                        color={
                            comparisonResult.startsWith("Match")
                                ? "success"
                                : "danger"
                        }
                        variant="flat"
                    >
                        {comparisonResult}
                    </Chip>
                </div>
            )}
        </div>
    );
}
