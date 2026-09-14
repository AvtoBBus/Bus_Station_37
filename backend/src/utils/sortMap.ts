export function sortMap(
    mainStorage: Map<string, { id: string, order: number, initialOrder: number, selected: boolean }>,
    sortSelected: boolean,
) {
    const keysToSort: string[] = [];
    
    for (const [key, value] of mainStorage.entries()) {
        if (value.selected === sortSelected) {
            keysToSort.push(key);
        }
    }

    keysToSort.sort((keyA, keyB) => {
        return mainStorage.get(keyA)!.order - mainStorage.get(keyB)!.order;
    });

    const oldStorage = new Map(mainStorage);
    mainStorage.clear();

    let sortedIndex = 0;

    for (const [key, value] of oldStorage.entries()) {
        if (value.selected === sortSelected) {
            const sortedKey = keysToSort[sortedIndex++];
            mainStorage.set(sortedKey, oldStorage.get(sortedKey)!);
        } else {
            mainStorage.set(key, value);
        }
    }
};
