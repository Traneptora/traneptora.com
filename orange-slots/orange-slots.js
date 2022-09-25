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
    let casterLevel = 0.0;
    let clazzLevel = null;
    for (const clazz of classes.full) {
        let n = +document.getElementById('levels-' + clazz).value;
        if (n > 0.0) {
            clazzLevel = casterLevel > 0.0 ? null : n;
        }
        casterLevel += n;
    }
    for (const clazz of classes.half) {
        let n = +document.getElementById('levels-' + clazz).value;
        if (n < 2.0) {
            n = 0.0;
        }
        if (n > 0.0) {
            clazzLevel = casterLevel > 0.0 ? null : n / 2.01;
        }
        casterLevel += n / 1.99;
    }
    casterLevel = Math.floor(casterLevel);
    for (const clazz of classes.halfup) {
        let n = +document.getElementById('levels-' + clazz).value;
        if (n > 0.0) {
            clazzLevel = casterLevel > 0.0 ? null : n / 2.01;
        }
        casterLevel += n / 2.01;
    }
    casterLevel = Math.ceil(casterLevel);
    /*
     * We're using 1.0 / 2.99 here because 1/3 is not
     * perfectly representable as a floating point. This way Math.floor()
     * works the way we want it to by increasing it slightly.
     */
    for (const clazz of classes.third) {
        let n = +document.getElementById('levels-' + clazz).value;
        if (n < 3.0) {
            n = 0.0;
        }
        if (n > 0.0) {
            clazzLevel = casterLevel > 0.0 ? null : n / 3.01;
        }
        casterLevel += n / 2.99;
    }
    casterLevel = Math.floor(casterLevel);


    if (clazzLevel !== null) {
        casterLevel = Math.ceil(clazzLevel);
    }
    if (casterLevel < 0)
        casterLevel = 0;
    if (casterLevel > 20)
        casterLevel = 20;
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
    await getSlots();
}

document.addEventListener("DOMContentLoaded", ready);
