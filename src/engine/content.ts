export const SENTENCES = [
    "The firewall is melting under the pressure of the binary flood.",
    "Injecting the payload into the mainframe before the security algorithms detect us.",
    "Decryption keys are synchronizing with the quantum processor.",
    "Bypassing the proxy server to access the restricted data nodes.",
    "The neural network is learning from our mistakes in real time.",
    "Overclocking the CPU to handle the massive data stream injection.",
    "The glitch in the matrix is expanding rapidly across the system.",
    "Compiling the source code while the servers are burning down.",
    "Attempting to root the device using an exploit in the kernel.",
    "Trace route complete. Target identified. Initiating protocol zero."
];

export const getRandomSentence = () => {
    return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
};
