function get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff){
    return Math.sqrt(1.0 + reload_stat / 100.0 * (1 + reload_percent_buff / 100.0)) * Math.SQRT1_2 / weapon_cooldown; 
}

function get_bbcooldown(weapon_cooldown, rld_stat_base, rld_bonus, reload_percent_buff, has_timed_reload_buff, timed_reload_percent_buff, timed_reload_buff_duration, cooldown_reduction_percent, init_cooldown_reduction_percent, has_boomer_fcr){
    const reload_stat = rld_stat_base + rld_bonus;
    let init_cooldown = 1.0 / get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff);
    let cooldown;
    if (!has_timed_reload_buff || timed_reload_buff_duration <= 0 || timed_reload_percent_buff <= 0){
        cooldown = init_cooldown;
    } else {
        const speed_with_timed_buff = get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff + timed_reload_percent_buff);
        const completion_with_buff = speed_with_timed_buff * timed_reload_buff_duration; 
        if (completion_with_buff >= 1.0){
            cooldown = 1.0 / speed_with_timed_buff;
        } else {
            const speed_without_timed_buff = get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff);
            cooldown = (1.0 - completion_with_buff) / speed_without_timed_buff + timed_reload_buff_duration;
        }
    }
    const cd_reduction = +cooldown_reduction_percent / 100.0;
    const init_cd_reduction = +init_cooldown_reduction_percent / 100.0 + cd_reduction + (has_boomer_fcr ? 0.15 : 0.0);
    init_cooldown *= (1.0 - init_cd_reduction);
    if (init_cooldown < 0.0) {
        return {
            'success': false,
            'error': 'Invalid initial cooldown'
        };
    }
    cooldown *= (1.0 - cd_reduction);
    if (cooldown < 0.0) {
        return {
            'success': false,
            'error': 'Invalid cooldown'
        };
    }
    init_cooldown += 1.6;
    cooldown += 0.1;

    if (cooldown >= 300.0 || init_cooldown >= 300.0) {
        return {
            'success': false,
            'error': '(Initial)? cooldown too large'
        };
    }

    if (!cooldown || !init_cooldown) {
        return {
            'success': false,
            'error': 'Some error occurred :('
        };
    }

    const shot_count = Math.trunc((300.0 - init_cooldown) / cooldown) + 1;
    const timers = Array.from(new Array(shot_count),
        (_, i) => roundBase10(init_cooldown + i * cooldown, 2));
    const cd_str = roundBase10(cooldown, 2);
    const init_cd_str = timers[0];
    return {
        'success': true,
        'cooldown': cd_str,
        'initCooldown': init_cd_str,
        'timers': timers
    };
}

function update_guntextfields() {
    const tempRLD = document.getElementById("bb-cd-red-3-enable").checked;
    document.querySelectorAll('.bb-cd-red-3-container').forEach((el) => {
        if (tempRLD){
            el.style.filter = 'brightness(100%)';
            const inp = el.querySelector('input');
            inp.disabled = false;
            inp.style.userSelect = 'auto';
        } else {
            el.style.filter = 'brightness(35%)';
            const inp = el.querySelector('input');
            inp.disabled = true;
            inp.style.userSelect = 'none';
        }
    });

    const currCd = document.querySelector('#bb-mg-1-dropdown option:checked').dataset.cd;
    document.getElementById('bb-mg-1-txt').value = currCd;
    // standard CSS/JS uses checked here
    // event tho it's a selectbox
    const option = document.querySelector('#bb-mg-1-dropdown option:checked');
    const name = option.value;
    const imgname = option.dataset.imgname;
    const img = document.getElementById('bb-mg-1-img');
    img.src = '/azur-lane/img/equip/gun/bb/' + imgname;
    img.alt = name;
}

function calculate_reload() {
    const rld_stat = document.getElementById("txt-rld-stat-base").value;
    const rld_bonus = document.getElementById("txt-rld-stat-bonus").value;
    const reloadbuff = document.getElementById("bb-rld-buff-txt").value;
    const weaponcd = document.getElementById("bb-mg-1-txt").value;
    const cooldown_reduction = document.getElementById("bb-cd-red-txt-1").value;
    const initial_cd_reduction = document.getElementById("bb-cd-red-txt-2").value;
    const has_timed_reload_buff = document.getElementById("bb-cd-red-3-enable").checked;
    const has_boomer_fcr = document.getElementById("bb-hpfcr-enable").checked;
    const timed_reload_percent_buff = document.getElementById("bb-cd-red-txt-3-quant").value;
    const timed_reload_buff_duration = document.getElementById("bb-cd-red-txt-3-time").value;
    const cooldown = get_bbcooldown(+weaponcd, +rld_stat, +rld_bonus, +reloadbuff, has_timed_reload_buff, +timed_reload_percent_buff, +timed_reload_buff_duration, +cooldown_reduction, +initial_cd_reduction, has_boomer_fcr);
    if (cooldown.success){
        document.getElementById('bb-result-cooldown').textContent = cooldown.cooldown + 's';
        document.getElementById('bb-result-init-cooldown').textContent = cooldown.initCooldown + 's';
        document.getElementById('bb-result-shot-timers').textContent = cooldown.timers?.join(', ');
    } else {
        document.getElementById("bb-result-cooldown").textContent = cooldown.error;
        document.getElementById("bb-result-init-cooldown").textContent = '';
        document.getElementById("bb-result-shot-timers").textContent = '';
    }
}

function get_fetch_url_impl(data){
    return '/azur-lane/data/' + data.battleshipJSON;
}

function handle_loadout_data_impl(data){
    // pass
}

async function ready() {
    const toc = fetch('/azur-lane/data/ships/battleships.json').then((r) => {
        return r.json();
    }).then((j) => {
        const cache = document.getElementById('select-ship-cache');
        handle_toc(j, cache.value || 'Georgia');
    });
    return toc.then(() => {
        document.querySelectorAll('#bb-mg-1-dropdown option').forEach((elem) => {
            const src = elem.dataset.imgname;
            if (src) {
                elem.style.background = 'url("/azur-lane/img/equip/gun/bb/' + src + '") no-repeat -200% -200%';
            }
        });
    });
}

update_guntextfields();
document.addEventListener("DOMContentLoaded", ready);
