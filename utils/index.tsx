export default function spawnExhaustiveSwitchError(item: never) {
    throw new Error(`${item} is not included in enum`);
}
