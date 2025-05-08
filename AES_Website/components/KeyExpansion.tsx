// AES_Website/components/KeyExpansion.tsx
"use client";
import { useState, useRef, ChangeEvent } from "react";
import { Button, Input, Textarea, Chip } from "@heroui/react";

import { expandKey } from "../utils/aesKeyExpansion";
import {
    validateHexKey,
    readFileContent,
    createFileInputHelpers,
} from "../utils/aesFormUtils";

const KeyExpansion = () => {
    const [key, setKey] = useState("30190dcc14585301f5bfc5b666c84775"); //  https://collegemath.org/aes/aes-key1.txt
    const [expandedKey, setExpandedKey] = useState<string>("");
    const [trace, setTrace] = useState<string>("");
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle key input
    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKey = e.target.value;

        setKey(newKey);
    };

    // Handle file upload
    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            readFileContent(file, setKey);
        }
    };

    const { triggerFileUpload, fileInputProps } = createFileInputHelpers(
        fileInputRef,
        handleFileUpload,
    );

    // Handle key expansion with the new utility
    const handleExpand = () => {
        try {
            if (!validateHexKey(key, setError)) {
                return;
            }

            const { expandedKeyHex, trace: traceOutput } = expandKey(
                key.trim(),
            );

            // Display round keys and trace
            setExpandedKey(expandedKeyHex);
            setTrace(traceOutput);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <div className="flex w-full gap-2">
                    <Input
                        className="flex-grow"
                        label="Hex Key"
                        placeholder="Enter hexadecimal key..."
                        value={key}
                        onChange={handleKeyChange}
                    />
                    <Button
                        className="self-end"
                        size="sm"
                        variant="flat"
                        onPress={triggerFileUpload}
                    >
                        Upload
                    </Button>
                    <input {...fileInputProps} />
                </div>
                <span className="text-sm text-gray-500">
                    Expected format: 32, 48, or 64 hexadecimal characters (128,
                    192, or 256-bit key)
                </span>
            </div>

            {error && (
                <Chip color="danger" variant="flat">
                    {error}
                </Chip>
            )}

            <Button color="primary" onPress={handleExpand}>
                Expand Key
            </Button>

            {expandedKey && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">
                        Expanded Key:
                    </h3>
                    <Textarea
                        readOnly
                        className="font-mono"
                        rows={3}
                        value={expandedKey}
                    />
                </div>
            )}

            {trace && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">
                        Expansion Trace:
                    </h3>
                    <Textarea
                        readOnly
                        className="font-mono"
                        rows={10}
                        value={trace}
                    />
                </div>
            )}
        </div>
    );
};

export default KeyExpansion;
