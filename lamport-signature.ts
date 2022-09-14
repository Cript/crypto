import readline from 'readline';
import crypto from "crypto";

type SecretKey = Buffer[][]
type PublicKey = SecretKey

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function question(question: string): Promise<string> {
    return new Promise(resolve => rl.question(question, answer => {
        resolve(answer)
    }))
}

const main = async () => {
    const message = await question('Enter message: ');
    rl.close()

    const privateKey = generatePrivateKey()
    const publicKey = generatePublicKey(privateKey)
    const signature = createSignature(message, privateKey)

    const result = checkSignature(message, publicKey, signature)

    console.log(result)
};

const hash = (value: Buffer): Buffer => {
    return crypto.createHash('sha256').update(value).digest()
}

const generatePrivateKey = (): SecretKey => {
    const secretKey: SecretKey = []

    for (let i = 0; i < 256; i++) {
        secretKey.push([
            crypto.randomBytes(32),
            crypto.randomBytes(32)
        ])
    }

    return secretKey
}

const generatePublicKey = (secretKey: SecretKey): PublicKey => {
    const publicKey: PublicKey = []

    for (const pair of secretKey) {
        publicKey.push([
            hash(pair[0]),
            hash(pair[1])
        ])
    }

    return publicKey
}

const createSignature = (message: string, secretKey: SecretKey): Buffer[] => {
    let signature: Buffer[] = []

    const hashedMessage = hash(Buffer.from(message))
    const hashedMessageBinary = bufferToBinaryString(hashedMessage)

    for (const [index, bit] of hashedMessageBinary.entries()) {
        signature.push(secretKey[index][bit])
    }

    return signature
}

const checkSignature = (message: string, publicKey: PublicKey, signature: Buffer[]): boolean => {
    const hashedMessage = hash(Buffer.from(message))
    const hashedMessageBinary = bufferToBinaryString(hashedMessage)
    const publicKeyForMessage: Buffer[] = []

    for (const [index, bit] of hashedMessageBinary.entries()) {
        publicKeyForMessage.push(publicKey[index][bit])
    }

    for (const [index, key] of publicKeyForMessage.entries()) {
        if (Buffer.compare(key, hash(signature[index])) !== 0) {
            return false
        }
    }

    return true
}

const bufferToBinaryString = (buffer: Buffer): number[] => {
    const bitsString = buffer.reduce(
        (acc, byte) => (acc += byte.toString(2).padStart(8, "0")),
        ""
    );

    return bitsString.split('').map(Number)
}

main();