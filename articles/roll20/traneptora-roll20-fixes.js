// ==UserScript==
// @name         Traneptora's Roll20 Cleanup Script
// @namespace    https://traneptora.com/
// @version      2025-04-03-02
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

(() => {
    const d20tranep = window.d20tranep || {};
    if (!window.d20tranep) {
        window.d20tranep = d20tranep;
    }
    const d20 = window.d20 || window.currentPlayer.d20;
    const $ = window.$;
    const permit_thorough = true;
    d20tranep.show_info = async (title, message) => {
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
    d20tranep.open_sheet = async (model, hidden) => {
        console.log(`Loading sheet: ${model.attributes.name}`);
        const cssrule = `div:has(div.characterdialog[data-characterid="${model.id}"]) { display: none !important; }`;
        const styleSheet = document.styleSheets[0];
        const ruleList = styleSheet.cssRules;
        const idx = hidden ? styleSheet.insertRule(cssrule) : 0;
        const close_sheet = async () => {
            model.view.remove();
            if (!hidden)
                return;
            if (ruleList[idx].cssText === cssrule) {
                styleSheet.deleteRule(idx);
                return;
            }
            for (let i = 0; i < ruleList.length; i++) {
                if (ruleList[i].cssText === cssrule) {
                    styleSheet.deleteRule(i);
                    return;
                }
            }
            return Promise.reject(`Couldn't find rule that was inserted for model: ${model.id}`);
        };
        document.querySelector(`li[data-itemid="${model.id}"]`).click();
        return new Promise((resolve, reject) => {
            let mancer_count = 0;
            let count = 0;
            const wait_open = function() {
                if (count++ >= 20) {
                    model.view.remove();
                    reject(`Timed out on loading page view for model: ${model.id}`);
                    return;
                }
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
                if (!mancer && mancer_count++ < 2) {
                    setTimeout(wait_open, 100);
                    return;
                }
                if (mancer) {
                    mancer.click();
                }
                resolve(close_sheet);
            };
            wait_open();
        });
    };
    d20tranep.detect_bad_token_default = async (model) => {
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
    d20tranep.detect_sheet_removal_issue = (model) => {
        if (!model.attributes.ownedBy) {
            return { "owned" : false, "api_id": undefined };
        }
        const parts = model.id.toString().split("_", 2);
        if (parts.length == 2) {
            return { "owned": true, "api_id": parts[1] };
        }
        return { "owned": true, "api_id": null };
    };
    d20tranep._check_bad_whisper0 = (model) => {
        const rtype = model.attribs.models.filter(m => m.attributes.name === "rtype");
        const wtype = model.attribs.models.filter(m => m.attributes.name === "wtype");
        return { "badwhisper": rtype.length > 0 && wtype.length > 0
            && rtype[0].attributes.current === "@{advantagetoggle}"
            && wtype[0].attributes.current.trim() === "", "wtype": (wtype.length > 0 ? wtype[0] : undefined) };
    };
    d20tranep.check_bad_whisper = (model) => {
        if (model.attribs.models.length > 0) {
            return d20tranep._check_bad_whisper0(model);
        }
        return { "badwhisper": undefined };
    };
    d20tranep.safe_fix_incorrect_token = async (scan) => {
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
    d20tranep.safe_fix_unremovable_sheet = async (scan) => {
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
    d20tranep.safe_fix_bad_whisper = async (scan) => {
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
    d20tranep.scan_model = async (model, thorough) => {
        let all_clear = true;
        const scan = {"model": model, "thorough": thorough};
        scan.rscan = d20tranep.detect_sheet_removal_issue(model);
        const rfix = await d20tranep.safe_fix_unremovable_sheet(scan);
        if (rfix.match && rfix.fix) {
            return {"all_clear": false, "later": false};
        }
        scan.tscan = await d20tranep.detect_bad_token_default(model);
        const tfix = await d20tranep.safe_fix_incorrect_token(scan);
        if (tfix.match && tfix.fix) {
            all_clear = false;
        }
        scan.wscan = d20tranep.check_bad_whisper(model);
        let close_callback = undefined;
        if (scan.wscan.badwhisper === undefined && thorough) {
            close_callback = await d20tranep.open_sheet(model, true)
                .catch((err) => { console.log(err); return null; } );
            if (close_callback)
                scan.wscan = d20tranep.check_bad_whisper(model);
        }
        const wfix = await d20tranep.safe_fix_bad_whisper(scan);
        if (wfix.match && wfix.fixed) {
            all_clear = false;
        }
        if (close_callback) {
            await close_callback().catch((err) => { console.log(err); return null; });
        }
        return {"all_clear": all_clear, "later": false};
    };
    d20tranep.perform_scan = async (thorough) => {
        let all_clear = true;
        const chars = d20.Campaign.activeCharacters();
        chars.sort();
        for (const model of chars) {
            const result = await d20tranep.scan_model(model, thorough)
                .catch((err) => { console.log(err); return null; });
            all_clear = result && result.all_clear && all_clear;
        }
        return all_clear;
    };
    d20tranep.scan_type_query = async () => {
        if (!window.is_gm) {
            const message = "You must be a GM in the game room to run this script.";
            await d20tranep.show_info("Must be GM", message);
            return Promise.reject(message);
        }
        if (!permit_thorough) {
            await d20tranep.show_info("Performing Scan", "Performing a quick scan.");
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
})();


await (async () => {
    const d20tranep = window.d20tranep;
    return d20tranep.scan_type_query().catch((err) => {
        console.log("Scan type query closed, doing nothing.");
        return Promise.reject(err);
    }).then((type) => {
        if (type === "fast") {
            return d20tranep.perform_scan(false);
        } else if (type === "thorough") {
            return d20tranep.perform_scan(true);
        }
    }).then((result) => {
        if (result) {
            return d20tranep.show_info("All Clear", "No sheet issues were found.");
        } else {
            return d20tranep.show_info("Scan completed.", "Scan completed.")
        }
    });
})();
