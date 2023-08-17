const classes = {
    'full': [
        'bard',
        'cleric',
        'druid',
        'sorcerer',
        'wizard'
    ],
    'half': [
        'paladin',
        'ranger'
    ],
    'halfup': [
        'artificer'
    ],
    'third': [
        'fighter',
        'rogue'
    ]
};

const slotTable = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 2, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 2, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 1, 0, 0, 0, 0, 0],
    [4, 3, 3, 2, 0, 0, 0, 0, 0],
    [4, 3, 3, 3, 1, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 2, 1, 1]
];

async function getSlots() {
    let casterLevel = 0;
    let classLevel = null;

    for (const clazz of classes.full) {
        let n = +document.getElementById('levels-' + clazz).value;
        if (n > 0) {
            classLevel = casterLevel > 0 ? null : 6 * n;
        }
        casterLevel += 6 * n;
    }

    for (const clazz of classes.half) {
        let n = +document.getElementById('levels-' + clazz).value;
        if (n < 2)
            n = 0;
        if (n > 0) {
            classLevel = casterLevel > 0 ? null : 3 * n;
        }
        casterLevel += 3 * n;
    }
    casterLevel -= casterLevel % 6;

    for (const clazz of classes.halfup) {
        let n = +document.getElementById('levels-' + clazz).value;
        if (n > 0) {
            classLevel = casterLevel > 0 ? null : 3 * n;
        }
        casterLevel += 3 * n;
    }
    casterLevel += 5 - (casterLevel + 5) % 6;

    for (const clazz of classes.third) {
        let n = +document.getElementById('levels-' + clazz).value;
        if (n < 3) {
            n = 0;
        }
        if (n > 0) {
            classLevel = casterLevel > 0 ? null : 2 * n;
        }
        casterLevel += 2 * n;
    }
    casterLevel -= casterLevel % 6;

    if (classLevel !== null) {
        casterLevel = classLevel + 5 - (classLevel + 5) % 6;
    }

    if (casterLevel < 0) {
        casterLevel = 0;
    }
    casterLevel = Math.trunc(casterLevel / 6);
    if (casterLevel > 20) {
        casterLevel = 20;
    }

    for (let i = 0; i < 9; i++) {
        document.getElementById('slots-' + (1 + i)).textContent = slotTable[casterLevel][i];
    }
}

async function ready() {
    for (const mcType in classes) {
        for (const clazz of classes[mcType]) {
            document.getElementById('levels-' + clazz).addEventListener('change', getSlots);
        }
    }
    return getSlots();
}

document.addEventListener("DOMContentLoaded", ready);
