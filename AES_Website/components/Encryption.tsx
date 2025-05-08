// AES_Website/components/Encryption.tsx
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

import { encryptAES } from "../utils/aesEncryption";
import { aesTestCases } from "../utils/testCases";
import {
    validateHexKey,
    fetchCleanFileContent,
    readFileContent,
    createFileInputHelpers,
} from "../utils/aesFormUtils";

import { UploadIcon, DownloadIcon } from "@/components/icons";

export default function Encryption() {
    const [textToEncrypt, setTextToEncrypt] = useState("");
    const [key, setKey] = useState("");
    const [useCBC, setUseCBC] = useState(false);
    const [error, setError] = useState("");
    const [encryptedText, setEncryptedText] = useState("");
    const [encryptionTrace, setEncryptionTrace] = useState("");
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
        setEncryptedText("");
        setEncryptionTrace("");
        setError("");

        if (tcKey) {
            const testCase = aesTestCases.find((tc) => tc.key === tcKey);

            if (testCase) {
                try {
                    const plainText = await fetchCleanFileContent(
                        testCase.plaintextFile,
                    );
                    const keyValue = await fetchCleanFileContent(
                        testCase.keyFile,
                    );

                    setTextToEncrypt(plainText);
                    setKey(keyValue);
                } catch (err: any) {
                    setError(`Error loading test case: ${err.message}`);
                    setTextToEncrypt(""); // Clear fields on error
                    setKey("");
                    setSelectedTestCaseKey(null); // Deselect on error
                }
            }
        }
    };

    // Handle text input change
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTextToEncrypt(e.target.value);
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
                setTextToEncrypt(value);
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

    // Handle download for encrypted text
    const handleDownloadEncryptedText = () => {
        if (!encryptedText) return;

        const blob = new Blob([encryptedText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        // Create a name for the file based on test case if selected
        let filename = "encrypted_text.txt";

        if (selectedTestCaseKey) {
            const testNumber = selectedTestCaseKey.replace("test", "");
            const mode = useCBC ? "cbc" : "ecb";

            filename = `aes-ciphertext${testNumber}-${mode}.txt`;
        }

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Handle download for encryption trace
    const handleDownloadEncryptionTrace = () => {
        if (!encryptionTrace) return;

        const blob = new Blob([encryptionTrace], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        // Create a name for the file based on test case if selected
        let filename = "encryption_trace.txt";

        if (selectedTestCaseKey) {
            const testNumber = selectedTestCaseKey.replace("test", "");
            const mode = useCBC ? "cbc" : "ecb";

            filename = `aes-trace${testNumber}-${mode}.txt`;
        }

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Handle encryption
    const handleEncrypt = async () => {
        try {
            if (!textToEncrypt) {
                setError("Text to encrypt cannot be empty");

                return;
            }

            if (!validateHexKey(key, setError)) {
                return;
            }

            // Use the AES encryption utility
            const { ciphertext, trace } = encryptAES(
                textToEncrypt,
                key,
                useCBC,
            );

            setEncryptedText(ciphertext);
            setEncryptionTrace(trace);
            setError("");

            // Perform comparison if a test case is selected
            if (selectedTestCaseKey) {
                const testCase = aesTestCases.find(
                    (tc) => tc.key === selectedTestCaseKey,
                );

                if (testCase) {
                    const expectedCiphertextFile = useCBC
                        ? testCase.cbcCiphertextFile
                        : testCase.ecbCiphertextFile;

                    // Skip comparison if no ciphertext file exists
                    if (expectedCiphertextFile) {
                        const expectedCiphertext = await fetchCleanFileContent(
                            expectedCiphertextFile,
                        );

                        // Directly compare the ciphertexts
                        if (ciphertext === expectedCiphertext) {
                            setComparisonResult("Match!");
                        } else {
                            setComparisonResult(
                                `Mismatch! Expected: ${expectedCiphertext}, Got: ${ciphertext}`,
                            );
                        }
                    } else {
                        setComparisonResult(
                            "No reference ciphertext available for this test case.",
                        );
                    }
                }
            } else {
                setComparisonResult(null); // Clear comparison if no test case active
            }
        } catch (err: any) {
            setError(err.message);
            setComparisonResult(null); // Clear on general encryption error too
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">AES Encryption</h3>

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
                    {aesTestCases.map((tc) => (
                        <SelectItem key={tc.key}>{tc.label}</SelectItem>
                    ))}
                </Select>
            </div>

            {/* Text to encrypt input */}
            <div className="flex flex-col gap-2">
                <div className="flex w-full gap-2">
                    <Input
                        className="flex-grow"
                        label="Text to encrypt"
                        placeholder="Enter text to encrypt..."
                        value={textToEncrypt}
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
                        setSelectedTestCaseKey(null); // Deselect test case on mode change
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

            {/* Encrypt button */}
            <Button color="primary" onPress={handleEncrypt}>
                Encrypt
            </Button>

            {/* Display encrypted result */}
            {encryptedText && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">
                            Encrypted Text (Hex):
                        </h3>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={handleDownloadEncryptedText}
                        >
                            <DownloadIcon size={20} />
                        </Button>
                    </div>
                    <Textarea
                        readOnly
                        className="font-mono"
                        rows={3}
                        value={encryptedText}
                    />
                </div>
            )}

            {/* Display encryption trace */}
            {encryptionTrace && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">
                            Encryption Trace:
                        </h3>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={handleDownloadEncryptionTrace}
                        >
                            <DownloadIcon size={20} />
                        </Button>
                    </div>
                    <Textarea
                        readOnly
                        className="font-mono"
                        rows={10}
                        value={encryptionTrace}
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
