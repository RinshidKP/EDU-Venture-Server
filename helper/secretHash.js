import bcrypt from 'bcrypt';

export const secretHash = async (secret) => {
    try {
        const hash = await bcrypt.hash(secret, 10);
        return hash;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const compareSecret = async (inputSecret, hashedSecret) => {
    try {
        const isMatch = await bcrypt.compare(inputSecret, hashedSecret);
        return isMatch;
    } catch (error) {
        console.error(error);
        return false;
    }
};
