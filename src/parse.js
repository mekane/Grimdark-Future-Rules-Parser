var numberName = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
};

const noop = _ => _;

const anyModelMayRegex = /^Any model may (.*)$/;
const replaceOneRegex = /(?:[Rr]eplace) (all |any |one )?(\w+ ?\w+)$/;
const replaceTwoRegex = /(?:[Rr]eplace) (all |any |one )?(\w+ ?\w+) and (\w+ ?\w+)/;
const replaceThreeRegex = /(?:[Rr]eplace) (all |any |one )?(\w+ ?\w+), (\w+ ?\w+),? and (\w+ ?\w+)$/;

function parseGroup(upgradeText) {
    let stringToParse = stripTrailingCharacter(upgradeText, ':');

    const upgradeSpec = {};

    const anyModelMatch = stringToParse.match(anyModelMayRegex);
    if (anyModelMatch !== null) {
        upgradeSpec.limit = "models";
        stringToParse = anyModelMatch[1];
    }

    const token = stringToParse.split(' ');
    const action = token[0];

    if (action.toLowerCase() === 'replace') {
        const replace3 = stringToParse.match(replaceThreeRegex);
        if (replace3 !== null)
            populateReplaceSpec(upgradeSpec, replace3);
        else { //try two
            const replace2 = stringToParse.match(replaceTwoRegex);
            if (replace2 !== null)
                populateReplaceSpec(upgradeSpec, replace2);
            else {
                const replace1 = stringToParse.match(replaceOneRegex);
                if (replace1 !== null)
                    populateReplaceSpec(upgradeSpec, replace1);
                else {
                    console.log(`Didn't find any matches for replace rule ${stringToParse}`);

                    if (token[1] + token[2] === 'upto')
                        upgradeSpec.limit = numberName[token[3]];

                    const allRemainingTokens = token.slice(4);

                    upgradeSpec.replace = allRemainingTokens.map(makeSingular);
                }
            }
        }
    }
    else if (action === 'Take')
        noop();
    else if (action === 'Upgrade')
        noop();
    else
        throw new Error(`Unknown action ${action}`);


    /*
        const test = stringToParse.match(/foo/);
        if (test !== null) {
            console.log('==================== TEST ====================');
            console.log(test);
        }
    */

    return upgradeSpec;
}

function stripTrailingCharacter(str, char) {
    return str.charAt(str.length - 1) === char ? str.slice(0, -1) : str;
}

function makeSingular(str) {
    return stripTrailingCharacter(str, 's');
}

function populateReplaceSpec(upgrade, match) {
    const all = match[1] || '';
    const weapon1 = match[2];
    const weapon2 = match[3];
    const weapon3 = match[4];

    if (all.trim() === 'all') {
        upgrade.replaceAll = [makeSingular(weapon1)];

        if (weapon2)
            upgrade.replaceAll.push(makeSingular(weapon2));

        if (weapon3)
            upgrade.replaceAll.push(makeSingular(weapon3));
    }
    else {
        upgrade.replace = [weapon1];

        if (weapon2)
            upgrade.replace.push(weapon2);

        if (weapon3)
            upgrade.replace.push(weapon3);
    }

    upgrade.limit = upgrade.limit || 1;

    if (all.trim() === 'any')
        delete upgrade.limit;

    console.log(`Replace ${all}${weapon1}${' ' + (weapon2 || '')}${' ' + (weapon3 || '')}`);
}

/**
 * (\w+ ?\w+) - capturing group for a one-or-two-word name (optional space)
 *
 * (\d{1,2}) - capturing group to match a one or two digit range
 * (?:"|”) - non-capturing group to match either double quotes or fancy quotes
 * ,
 * ** All of the above is wrapped in a non-capturing group to make range optional
 *
 * A(\d{1,2}) - captures a one or two digit number of attacks
 * ([,\w \(\)]*)\) - just captures all of the potential rules text, to be parsed later
 *  \+(\d{1,3})pts - captures the number part of the points
 */
const weaponSpec = /^([\w- ]+) \((?:(\d{1,2})(?:"|”), )?A(\d{1,2})([,\w \(\)]*)\)(?: \+(\d{1,3})pts)?$/;

function parseUpgrade(stringToParse) {
    const pattern = stringToParse.match(weaponSpec);

    let upgrade = {};

    if (pattern == null) {
        return parseNonWeaponUpgrade(stringToParse);
    }
    else {
        upgrade = weaponObjectFromRegexMatch(pattern);
        const cost = upgrade.cost;
        delete upgrade.cost;
        return {
            name: '',
            rules: [],
            weapons: [
                upgrade
            ],
            cost
        }
    }
}

function weaponObjectFromRegexMatch(matchObj) {
    const range = parseInt(matchObj[2], 10);

    const weapon = {
        name: matchObj[1],
        range: isNaN(range) ? 'melee' : range,
        attacks: parseInt(matchObj[3], 10),
        rules: parseRules(matchObj[4])
    };

    const cost = parseInt(matchObj[5], 10);

    if (!isNaN(cost))
        weapon.cost = cost;

    return weapon;
}

function parseRules(stringToParse) {
    if (typeof stringToParse === 'undefined' || stringToParse == '')
        return [];

    return stringToParse.trim().replace(/,/g, '').split(' ').filter(s => s.length);
}

function parseNonWeaponUpgrade(stringToParse) {
    const pattern = stringToParse.match(/([\w- ]+) (?:\(([\w-\+,” \(\)]+)\))? ?\+(\d{1,3})pts$/);

    let ruleTokens = [];
    const rules = [];
    const weapons = [];

    if (pattern[2] && pattern[2].length) {
        ruleTokens = splitByCommas(pattern[2]);
        ruleTokens.forEach(t => {
            let weapon = t.match(weaponSpec);
            if (weapon == null)
                rules.push(t);
            else
                weapons.push(weaponObjectFromRegexMatch(weapon));
        });
    }

    return {
        name: pattern[1],
        rules: rules,
        weapons: weapons,
        cost: parseInt(pattern[3], 10)
    };
}

function splitByCommas(textToTokenize) {
    const tokens = [];

    let currentToken = '';
    let insideParens = false;

    for (let i = 0; i < textToTokenize.length; i++) {
        let char = textToTokenize.charAt(i);

        if (char === '(')
            insideParens = true;
        if (char === ')')
            insideParens = false;

        if (char === ',' && !insideParens) {
            tokens.push(currentToken);
            currentToken = '';
        }
        else
            currentToken += char;
    }
    tokens.push(currentToken);

    return tokens.map(s => s.trim()).filter(s => s.length);
}

module.exports = {
    parseGroup,
    parseUpgrade,
    splitByCommas
};
