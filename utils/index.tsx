export default function spawnExhaustiveSwitchError(item: never) {
    throw new Error(`${item} is not included in enum`);
}

export const u: {
    assert: (value: unknown, message?: string | Error) => asserts value;
} = {
    assert(value: unknown, message?: string | Error): asserts value {
        if (!value) {
            throw message instanceof Error
                ? message
                : new Error(message || 'Assertion failed');
        }
    },
};
