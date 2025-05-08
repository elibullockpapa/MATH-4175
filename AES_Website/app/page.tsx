// AES_Website/app/page.tsx
"use client";
import { Tabs, Tab, Card, CardBody } from "@heroui/react";

import { title, subtitle } from "@/components/primitives";
import KeyExpansion from "@/components/KeyExpansion";
import Encryption from "@/components/Encryption";
import Decryption from "@/components/Decryption";

export default function Home() {
    return (
        <section className="flex flex-col items-center justify-center py-8 md:py-10">
            <div className="inline-block max-w-full text-center justify-center">
                <h1 className={title({ size: "lg" })}>
                    AES Encryption &amp; Decryption Tool
                </h1>
                <h2 className={subtitle({ class: "mt-4" })}>
                    Encrypt and decrypt data using AES-128/192/256 in ECB or CBC
                    mode
                </h2>
            </div>

            <div className="mt-8 w-full">
                <Tabs aria-label="AES Operations">
                    <Tab key="key-expansion" title="Key Expansion">
                        <Card>
                            <CardBody>
                                <KeyExpansion />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="encryption" title="Encryption">
                        <Card>
                            <CardBody>
                                <Encryption />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="decryption" title="Decryption">
                        <Card>
                            <CardBody>
                                <Decryption />
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </section>
    );
}
