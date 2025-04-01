// ==UserScript==
// @name         Traneptora's Roll20 Cleanup Script
// @namespace    https://traneptora.com/
// @version      2025-04-01
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
    const safe_fix_incorrect_token = (scan) => {
        const tscan = scan.tscan;
        if (tscan.correct || !tscan.found) {
            return false;
        }
        $(`<div class='dialog'>Found an issue with sheet: ${scan.model.attributes.name}.<br>Its default token is pointing to a different sheet: ${tscan.repr.attributes.name}.<br>Would you like this to be fixed?</div>`)
            .dialog({"modal": true, "title": "Fix this issue?", "buttons": {
                "No, do nothing.": function() { $(this).dialog("destroy").remove(); },
                "Yes, please.": function() {
                    $(this).dialog("destroy").remove();
                    scan.model.getDefaultToken().then((token) => {
                        token.represents = scan.model.id;
                        scan.model.saveDefaultToken(token);
                    });
        }}});
        return true;
    };
    const safe_fix_unremovable_sheet = (scan) => {
        const rscan = scan.rscan;
        if (!rscan.owned || rscan.api_id) {
            return false;
        }
        $(`<div class='dialog'>Found a linked sheet that you probably can't get rid of: ${scan.model.attributes.name}.<br>Would you like it to be deleted?"`)
            .dialog({"modal": true, "title": "Confirm Deletion", "buttons": {
                "No, do nothing.": function() { $(this).dialog("destroy").remove(); },
                "Yes, please delete.": function() {
                    $(this).dialog("destroy").remove();
                    scan.model.attributes.ownedBy = undefined;
                    scan.model.destroy();
            }}});
        return true;
    };
    const statuses = await Promise.all(d20.Campaign.activeCharacters().map(async (model) => {
        const obj = {"model": model};
        obj.rscan = detect_sheet_removal_issue(model);
        return detect_bad_token_default(model).then((tscan) => {
            obj.tscan = tscan;
            return obj;
        });
    }));
    let found_any = false;
    found_any = statuses.filter((scan) => !scan.tscan.correct).map(safe_fix_incorrect_token).find(a => a)
        || found_any;
    found_any = statuses.filter((scan) => scan.rscan.owned).map(safe_fix_unremovable_sheet).find(a => a)
        || found_any;
    if (!found_any) {
        $("<div class='dialog'>No sheet issues were found.</div>").dialog({"modal": true, "title": "All Clear", "buttons": {"OK": function() { $(this).dialog("destroy").remove(); }}});
    }
})();
