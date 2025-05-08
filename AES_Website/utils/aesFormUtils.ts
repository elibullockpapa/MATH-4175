/**
 * Validates an AES key in hexadecimal format
 * @param input Hexadecimal key string
 * @param setError Function to set error message
 * @returns Boolean indicating if key is valid
 */
export const validateHexKey = (
    input: string,
    setError: (message: string) => void,
): boolean => {
    if (!input) {
        setError("Key cannot be empty");

        return false;
    }

    const hexPattern = /^[0-9A-Fa-f]+$/;

    if (!hexPattern.test(input)) {
        setError("Key must contain only hex characters (0-9, A-F)");

        return false;
    }

    // Check for common AES key lengths (128, 192, 256 bits)
    if (input.length !== 32 && input.length !== 48 && input.length !== 64) {
        setError(
            "Hex key must be 32, 48, or 64 characters (128, 192, or 256 bits)",
        );

        return false;
    }

    setError("");

    return true;
};

/**
 * Fetches and cleans content from a file path
 * @param filePath Path to the file to fetch
 * @returns Promise with cleaned content
 */
export const fetchCleanFileContent = async (
    filePath: string,
): Promise<string> => {
    const response = await fetch(filePath);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
    }
    const text = await response.text();

    return text.replace(/\s+/g, ""); // Clean whitespace and newlines
};

/**
 * Reads and processes a file selected by the user
 * @param file The file object from input
 * @param setValue Function to set the value from the file
 */
export const readFileContent = (
    file: File,
    setValue: (value: string) => void,
): void => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
        const content = event.target?.result as string;
        // Clean up the content (remove whitespace, newlines)
        const cleanedContent = content.replace(/\s+/g, "");

        setValue(cleanedContent);
    };
    reader.readAsText(file);
};

/**
 * Creates a file input helper component props
 * @param fileInputRef Reference to the file input
 * @param handleFileUpload Function to handle file changes
 * @returns Props for the file upload UI elements
 */
export const createFileInputHelpers = (
    fileInputRef: React.RefObject<HTMLInputElement>,
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
) => {
    return {
        triggerFileUpload: () => {
            fileInputRef.current?.click();
        },
        fileInputProps: {
            ref: fileInputRef,
            accept: ".txt",
            className: "hidden",
            type: "file",
            onChange: handleFileUpload,
        },
    };
};
