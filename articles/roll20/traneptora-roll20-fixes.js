// ==UserScript==
// @name         Traneptora's Roll20 Cleanup Script
// @namespace    https://traneptora.com/
// @version      2025-04-03
// @description  Traneptora's Roll20 Cleanup Script
// @author       Traneptora

// @match        https://app.roll20.net/editor
// @match        https://app.roll20.net/editor#*
// @match        https://app.roll20.net/editor?*
// @match        https://app.roll20.net/editor/
// @match        https://app.roll20.net/editor/#*
// @match        https://app.roll20.net/editor/?*

// @run-at       context-menu

// @grant        none
// ==/UserScript==

await (async () => {
    const d20 = window.d20 || window.currentPlayer.d20;
    const $ = window.$;
    const permit_thorough = true;
    const show_info = async function(title, message) {
        const $dialog = $(`<div class='dialog'>${message}</div>`);
        return new Promise((resolve, reject) => {
            $dialog.dialog({
                "modal": true,
                "title": title,
                "buttons": {
                    "OK": function() {
                        $dialog.dialog("destroy").remove();
                        resolve();
                    }
                },
                "close": reject,
            });
        });
    }
    const open_sheet = async (model, hidden) => {
        console.log(`Loading sheet: ${model.attributes.name}`);
        const cssrule = `div:has(div.characterdialog[data-characterid="${model.id}"]) { display: none !important; }`;
        let idx = 0;
        if (hidden)
            idx = document.styleSheets[0].insertRule(cssrule);
        document.querySelector(`li[data-itemid="${model.id}"]`).click();
        return new Promise((resolve, reject) => {
            let mancer_checked = false;
            const wait_open = function() {
                if (!model.view.el.firstElementChild) {
                    setTimeout(wait_open, 100);
                    return;
                }
                if (!model.view.el.firstElementChild.contentDocument) {
                    setTimeout(wait_open, 100);
                    return;
                }
                if (!model.view.el.firstElementChild.contentDocument.querySelector(".charactersheet")) {
                    setTimeout(wait_open, 100);
                    return;
                }
                const mancer = model.view.el.firstElementChild.contentDocument
                    .querySelector(".mancer_confirm input[name=attr_mancer_cancel]");
                if (!mancer && !mancer_checked) {
                    mancer_checked = true;
                    setTimeout(wait_open, 100);
                    return;
                }
                if (mancer) {
                    mancer.click();
                }
                resolve(idx);
            };
            wait_open();
        });
    };
    const load_sheet = async (model, hidden) => {
        const idx = await open_sheet(model, hidden);
        model.view.remove();
        if (hidden)
            document.styleSheets[0].deleteRule(idx);
    };
    const detect_bad_token_default = async function(model) {
        return model.getDefaultToken().then((token) => {
            if (token.represents === model.id) {
                return { "correct": true, "found": true };
            }
            if (!token.represents) {
                return { "correct": true, "found": false };
            }
            const repr = d20.journal.findJournalItem(token.represents);
            return { "correct": false, "found": !!repr, "repr": repr};
        });
    };
    const detect_sheet_removal_issue = function(model) {
        if (!model.attributes.ownedBy) {
            return { "owned" : false, "api_id": undefined };
        }
        const parts = model.id.toString().split("_", 2);
        if (parts.length == 2) {
            return { "owned": true, "api_id": parts[1] };
        }
        return { "owned": true, "api_id": null };
    };
    const _check_bad_whisper0 = (model) => {
        const rtype = model.attribs.models.filter(m => m.attributes.name === "rtype");
        const wtype = model.attribs.models.filter(m => m.attributes.name === "wtype");
        return { "badwhisper": rtype.length > 0 && wtype.length > 0
            && rtype[0].attributes.current === "@{advantagetoggle}"
            && wtype[0].attributes.current.trim() === "", "wtype": (wtype.length > 0 ? wtype[0] : undefined) };
    };
    const check_bad_whisper = (model) => {
        if (model.attribs.models.length > 0) {
            return _check_bad_whisper0(model);
        }
        return { "badwhisper": undefined };
    };
    const safe_fix_incorrect_token = async (scan) => {
        return new Promise((resolve, reject) => {
            const tscan = scan.tscan;
            if (tscan.correct || !tscan.found) {
                resolve({ "match": false });
                return;
            }
            const $dialog = $(`<div class='dialog'>Found an issue with sheet: ${scan.model.attributes.name}.<br>Its default token is pointing to a different sheet: ${tscan.repr.attributes.name}.<br>Would you like this to be fixed?</div>`);
            $dialog.dialog({
                "modal": true,
                "title": "Fix this issue?",
                "buttons": {
                    "No, do nothing.": function() {
                        $dialog.dialog("destroy").remove();
                        resolve({ "match": true, "fix": false });
                    },
                    "Yes, please fix.": function() {
                        $dialog.dialog("destroy").remove();
                        scan.model.getDefaultToken().then((token) => {
                            token.represents = scan.model.id;
                            scan.model.saveDefaultToken(token);
                            resolve({ "match": true, "fix": true });
                        });
                    }
                },
                "close": function() {
                    resolve({ "match": true, "fix": false });
                }
            });
        });
    };
    const safe_fix_unremovable_sheet = async (scan) => {
        return new Promise((resolve, reject) => {
            const rscan = scan.rscan;
            if (!rscan.owned || rscan.api_id) {
                resolve({ "match": false });
                return;
            }
            const $dialog = $(`<div class='dialog'>Found a linked sheet that you probably can't get rid of: ${scan.model.attributes.name}.<br>Would you like it to be deleted?"`);
            $dialog.dialog({
                "modal": true,
                "title": "Confirm Deletion",
                "buttons": {
                    "No, do nothing.": function() {
                        $dialog.dialog("destroy").remove();
                        resolve({ "match": true, "fix": false });
                    },
                    "Yes, please delete.": function() {
                        $dialog.dialog("destroy").remove();
                        scan.model.attributes.ownedBy = undefined;
                        scan.model.destroy();
                        resolve({ "match": true, "fix": true });
                    }
                },
                "close": function() {
                    resolve({ "match": true, "fix": false });
                }
            });
        });
    };
    const safe_fix_bad_whisper = async (scan) => {
        const wscan = scan.wscan;
        if (!wscan.badwhisper) {
            return {"match": false};
        }
        const selectbox = scan.model.view.el?.firstElementChild?.contentDocument
            ?.querySelector(".is-npc select[name=attr_wtype]");
        if (selectbox) {
            console.log(`Enabling Whisper Toggle For: ${scan.model.attributes.name}`);
            selectbox.value = "@{whispertoggle}";
            await scan.model.view.saveSheetValues(selectbox);
        }
        return {"match": true, "fixed": !!selectbox};
    };
    const scan_model = async (model, thorough) => {
        let all_clear = true;
        const scan = {"model": model, "thorough": thorough};
        scan.rscan = detect_sheet_removal_issue(model);
        const rfix = await safe_fix_unremovable_sheet(scan);
        if (rfix.match && rfix.fix) {
            return {"all_clear": false, "later": false};
        }
        scan.tscan = await detect_bad_token_default(model);
        const tfix = await safe_fix_incorrect_token(scan);
        if (tfix.match && tfix.fix) {
            all_clear = false;
        }
        scan.wscan = check_bad_whisper(model);
        let idx = -1;
        if (scan.wscan.badwhisper === undefined && thorough) {
            idx = await open_sheet(model, true);
            scan.wscan = check_bad_whisper(model);
        }
        const wfix = await safe_fix_bad_whisper(scan);
        if (wfix.match && wfix.fixed) {
            all_clear = false;
        }
        if (idx >= 0) {
            model.view.remove();
            document.styleSheets[0].deleteRule(idx);
        }
        return {"all_clear": all_clear, "later": false};
    };
    const perform_scan = async (thorough) => {
        let all_clear = true;
        const chars = d20.Campaign.activeCharacters();
        chars.sort();
        for (const model of chars) {
            const result = await scan_model(model, thorough);
            all_clear = result.all_clear && all_clear;
        }
        return all_clear;
    };
    const scan_type_query = async () => {
        if (!window.is_gm) {
            const message = "You must be a GM in the game room to run this script.";
            await show_info("Must be GM", message);
            return Promise.reject(message);
        }
        if (!permit_thorough) {
            await show_info("Performing Scan", "Performing a quick scan.");
            return "fast";
        }
        return new Promise((resolve, reject) => {
            const $dialog = $(`<div class='dialog'>I can conduct a fast scan, or I can conduct a thorough scan. A fast scan can be performed very quickly. A thorough scan requires this script to load every sheet, but it can detect more issues. Which would you prefer?`);
            $dialog.dialog({
                "modal": true,
                "title": "Choose Scan Type",
                "buttons": {
                    "Fast Scan": function() {
                        $dialog.dialog("destroy").remove();
                        resolve("fast");
                    },
                    "Thorough Scan": function() {
                        $dialog.dialog("destroy").remove();
                        resolve("thorough");
                    }
                },
                "close": function() {
                    reject("closed");
                }
            });
        });
    };
    return scan_type_query().then((type) => {
        if (type === "fast") {
            return perform_scan(false);
        } else if (type === "thorough") {
            return perform_scan(true);
        }
    }).then((result) => {
        if (result) {
            show_info("All Clear", "No sheet issues were found.");
        } else {
            show_info("Scan completed.", "Scan completed.")
        }
    });
})();
