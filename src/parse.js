const numberName = {
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

const ruleNames = [
    'Aircraft',
    'Ambush',
    'Fast',
    'Fear',
    'Fearless',
    'Flying',
    'Furious',
    'Hero',
    'Immobile',
    'Impact',
    'Psychic',
    'Regeneration',
    'Relentless',
    'Scout',
    'Slow',
    'Stealth',
    'Strider',
    'Tough',
    'Transport'
];

const noop = _ => _;

const anyModelMayRegex = /^Any model may (.*)$/;
const replaceOneRegex = /(?:[Rr]eplace) (all |any |one )?(\w+ ?\w+)$/;
const replaceTwoRegex = /(?:[Rr]eplace) (all |any |one )?(\w+ ?\w+) and (\w+ ?\w+)/;
const replaceThreeRegex = /(?:[Rr]eplace) (all |any |one )?(\w+ ?\w+), (\w+ ?\w+),? and (\w+ ?\w+)$/;

const ruleWithValueRegex = /^(\w+)\((\+?\d+)\)$/;

function parseUpgradeSection(rulesText) {

}

function parseUpgradeGroup(upgradeText) {
    let stringToParse = stripTrailingCharacter(upgradeText, ':');

    const upgradeSpec = {};

    const anyModelMatch = stringToParse.match(anyModelMayRegex);
    if (anyModelMatch !== null) {
        upgradeSpec.limit = "models";
        stringToParse = anyModelMatch[1];
    }

    const token = stringToParse.split(' ');
    const action = token[0];
    const nextWord = token[1];
    const nextTwoWords = token[1] + ' ' + token[2];
    const lastWord = token[token.length - 1];

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
    else if (action.toLowerCase() === 'take') {
        const number = token[1];
        let upgradeRequires = token.slice(2);

        if (lastWord.toLowerCase() === 'attachment') {
            upgradeRequires = token.slice(2, -1); //drop "attachment" to get the base item required
            if (upgradeSpec.limit === 'models')
                upgradeSpec.limit += ' with ' + upgradeRequires.join(' ');
        }

        if (!upgradeSpec.limit)
            upgradeSpec.limit = numberName[number];

        upgradeSpec.require = [upgradeRequires.join(' ')];
    }
    else if (action === 'Upgrade')
        if (nextWord === "with" || nextTwoWords === "one model")
            upgradeSpec.limit = 1;
        else
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
 * This regex is used to parse the definition of a weapon inside of an upgrade
 * line, which means it has a name, range + attacks + rules group, and a cost.
 *
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
    const name = matchObj[1];
    const range = parseInt(matchObj[2], 10);
    const attacks = parseInt(matchObj[3], 10);
    const rules = parseRules(matchObj[4]);

    const weapon = {
        name,
        range: isNaN(range) ? 'melee' : range,
        attacks,
        rules: []
    };

    //look for rules with values like AP(2) and add the values as properties to the weapon
    extractRulesWithValues(weapon, rules);

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

function extractRulesWithValues(upgradeObject, rulesText) {
    rulesText.forEach(rule => {
        const match = rule.match(ruleWithValueRegex);

        if (match) {
            const ruleText = match[1];
            const ruleValue = parseInt(match[2], 10);
            //console.log(`${ruleText} => ${ruleValue}`);
            upgradeObject.rules.push(ruleText);
            upgradeObject[ruleText.toLowerCase()] = ruleValue;
        }
        else
            upgradeObject.rules.push(rule);
    });
}

function parseNonWeaponUpgrade(stringToParse) {
    const pattern = stringToParse.match(/([\w- ]+) (?:\(([\w-\+,” \(\)]+)\))? ?\+(\d{1,3})pts$/);

    let upgradeTokens = [];
    const unitRules = [];
    const weapons = [];

    const name = pattern[1];

    if (pattern[2] && pattern[2].length) {
        upgradeTokens = splitByCommas(pattern[2]);
        upgradeTokens.forEach(t => {
            let weapon = t.match(weaponSpec);
            if (weapon == null)
                unitRules.push(t);
            else
                weapons.push(weaponObjectFromRegexMatch(weapon));
        });
    }

    const cost = parseInt(pattern[3], 10);

    const upgrade = {
        name,
        rules: [],
        weapons,
        cost
    };

    extractRulesWithValues(upgrade, unitRules);

    return upgrade;
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

/*
Name    Num Q  D  (W                     , W      ) Rule     , Rule, Rule, Rule,  Up, Up, Up Cost
Captain [1] 3+ 2+ Assault Rifle (24”, A1), CCW (A1) Fearless, Hero, Relentless, Tough(3) A, B, C 110pts
*/

function parseUnit(stringToParse) {
    if (typeof stringToParse !== 'string' || stringToParse.length < 1) {
        throw new Error('missing unit name');
    }

    const token = stringToParse.split(' ');

    let name = '';

    //find name by looking until we hit a [x]
    while (token.length && !token[0].startsWith('[')) {
        name += token[0] + ' ';
        token.shift();
    }

    if (token.length < 1) {
        throw new Error('missing model count after unit name');
    }

    //assume the next token is [integer], and parse it
    const textBetweenBrackets = token[0].slice(1, -1);
    const models = parseInt(textBetweenBrackets, 10);

    if (isNaN(models)) {
        throw new Error(`invalid number of models (${textBetweenBrackets})`);
    }

    token.shift();

    //assume quality looks like n+
    const quality = parseInt(token[0], 10);
    if (isNaN(quality)) {
        throw new Error(`invalid quality (${token[0]})`);
    }

    token.shift();

    //assume defense looks like n+
    const defense = parseInt(token[0], 10);
    if (isNaN(defense)) {
        throw new Error(`invalid defense (${token[0]})`);
    }

    token.shift();

    //work backwards to get points
    let lastToken = token[token.length - 1];
    //assume points string ends with pts
    const pointsString = lastToken.slice(0, -3);
    const points = parseInt(pointsString, 10);
    if (isNaN(points)) {
        throw new Error(`invalid points (${pointsString})`);
    }

    token.pop();

    //work backwards to get upgrades until we see a rule
    lastToken = token[token.length - 1];

    const upgrades = [];
    while (!!lastToken && !isRuleName(lastToken)) {
        let rule = token.pop();
        if (rule !== '-') {
            if (rule.endsWith(',')) {
                rule = rule.slice(0, -1);
            }
            upgrades.unshift(rule);
        }
        lastToken = token[token.length - 1];
    }

    //work backwards and grab all the rules
    const rules = [];
    while (token.length && isRuleName(lastToken)) {
        let rule = token.pop();
        if (rule !== '-') {
            if (rule.endsWith(',')) {
                rule = rule.slice(0, -1);
            }
            rules.unshift(rule);
        }
        lastToken = token[token.length - 1];
    }

    const remainingText = token.join(' ');
    const weaponTokens = splitByCommas(remainingText);

    const equipment = [];
    weaponTokens.forEach(weaponText => {
        const pattern = weaponText.match(weaponSpec);

        if (pattern === null) {
            throw new Error('invalid weapons (' + weaponText + ')')
        }

        const weapon = weaponObjectFromRegexMatch(pattern);
        equipment.push(weapon);
    });

    return {
        name: name.trim(),
        models,
        quality,
        defense,
        equipment,
        rules,
        upgrades,
        points
    };
}

function isRuleName(text) {
    return ruleNames.some(name => text.startsWith(name));
}

module.exports = {
    parseUpgradeGroup,
    parseUpgradeSection,
    parseUpgrade,
    splitByCommas,
    parseUnit
};
