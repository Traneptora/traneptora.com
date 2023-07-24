const die_range = (n) => [...Array(n).keys()].map(x => x + 1);
const dr = (n) => 0.5 * (n + 1);
const die_range_reroll = (n, k) => {
    const m = dr(n);
    return die_range(n).map((x) => x <= k ? m : x);
};
const total = (l) => l.reduce((x, y) => x + y, 0);
const mean = (l) => total(l) / l.length;
const dro = (n, k) => mean(die_range_reroll(n, k));
const cl = (l) => [...l.values()];
const mssl = (l) => {
    const v = cl(l);
    v.unshift(1 - total(v));
    return v;
};
const p0 = (l) => {
    const v = cl(l);
    v.unshift(0);
    return v;
};
const hit = (target, bonus, crit) => [0.05 * (crit - target + total([bonus].flat())), 0.05 * (21 - crit)];
const acc = (l) => {
    const v = l.reduce((x, y) => {
        x.push(x[x.length - 1] + y);
        return x;
    }, [0]);
    v.shift();
    return v;
};
const diff = (l) => {
    const v = new Array(l.length - 1);
    for (const i of v.keys()) {
        v[i] = l[i + 1] - l[i];
    }
    return v;
};
const advp = (l, n) => diff(acc(l).map(x => Math.pow(x, n)));
const sdadv = (l, n) => mssl(advp(l.toReversed(), n)).reverse();
const adv = (l) => advp(mssl(l), 2);
const eadv = (l) => advp(mssl(l), 3);
const qadv = (l) => advp(mssl(l), 4);
const dadv = (l) => {
    const v = sdadv(mssl(l), 2);
    v.shift();
    return v;
};
const id = (l) => l;
const dpa = (target, bonus_to_hit, crit_range, attack_type, normal_damage, crit_bonus_damage) => {
    const h = attack_type.call(undefined, hit(target, bonus_to_hit, crit_range));
    return h[0] * normal_damage + h[1] * (normal_damage + crit_bonus_damage);
};

