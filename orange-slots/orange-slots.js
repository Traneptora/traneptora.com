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
    let singleClassLevel = undefined;

    for (const clazz of classes.full) {
        const inp = +document.getElementById('levels-' + clazz).value;
        const n = inp > 0 && inp < 21 ? inp : 0;
        casterLevel += 6 * n;
        if (singleClassLevel === undefined) {
            singleClassLevel = casterLevel;
        } else if (singleClassLevel !== null) {
            singleClassLevel = null;
        }
    }

    for (const clazz of classes.half) {
        const inp = +document.getElementById('levels-' + clazz).value;
        const n = inp > 1 && inp < 21 ? inp : 0;
        casterLevel += 3 * n;
        if (singleClassLevel === undefined) {
            singleClassLevel = casterLevel;
        } else if (singleClassLevel !== null) {
            singleClassLevel = null;
        }
        casterLevel -= casterLevel % 6;
    }

    for (const clazz of classes.halfup) {
        const inp = +document.getElementById('levels-' + clazz).value;
        const n = inp > 0 && inp < 21 ? inp : 0;
        casterLevel += 3 * n;
        if (singleClassLevel === undefined) {
            singleClassLevel = casterLevel;
        } else if (singleClassLevel !== null) {
            singleClassLevel = null;
        }
        casterLevel += 5 - (casterLevel + 5) % 6;
    }

    for (const clazz of classes.third) {
        const inp = +document.getElementById('levels-' + clazz).value;
        const n = inp > 2 && inp < 21 ? inp : 0;
        casterLevel += 2 * n;
        if (singleClassLevel === undefined) {
            singleClassLevel = casterLevel;
        } else if (singleClassLevel !== null) {
            singleClassLevel = null;
        }
        casterLevel -= casterLevel % 6;
    }

    if (singleClassLevel !== null && singleClassLevel !== undefined) {
        casterLevel = singleClassLevel + 5 - (singleClassLevel + 5) % 6;
    }

    casterLevel = casterLevel < 0 ? 0 : casterLevel > 120 ? 120 : casterLevel;
    casterLevel = Math.trunc(casterLevel / 6);

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
