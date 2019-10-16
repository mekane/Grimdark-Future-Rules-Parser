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

const replaceOneRegex = /Replace (\w+)$/;
const replaceTwoRegex = /Replace (\w+ ?\w+) and (\w+ ?\w+)$/;
const replaceThreeRegex = /Replace (\w+ ?\w+), (\w+ ?\w+), and (\w+ ?\w+)$/;

function parseGroup(stringToParse) {
    const token = stringToParse.split(' ');

    const upgradeSpec = {
        add: []
    };


    if (token[0] === 'Replace')
        upgradeSpec.remove = [];
    else if (token[0] === 'Take')
        1 + 1;
    else if (token[0] === 'Upgrade')
        1 + 1;
    else
        throw new Error(`Unknown action ${token[0]}`);

    if (token[1] === 'one' || token[1] === 'all' || token[1] === 'with')
        upgradeSpec.limit = 1;
    else if (token[1] === 'any')
        noop();
    else if (token[1] + token[2] === 'upto')
        upgradeSpec.limit = numberName[token[3]];
    else {
        let replace = stringToParse.match(replaceThreeRegex);
        if (replace !== null) {
            const weapon1 = replace[1];
            const weapon2 = replace[2];
            const weapon3 = replace[3];
            //console.log(`Going to replace ${weapon1}, ${weapon2} and ${weapon3}`);
            upgradeSpec.limit = 1;
        }

        replace = stringToParse.match(replaceTwoRegex);
        if (replace !== null) {
            const weapon1 = replace[1];
            const weapon2 = replace[2];
            upgradeSpec.limit = 1;
        }

        replace = stringToParse.match(replaceOneRegex);
        if (replace !== null) {
            const weapon = replace[1];
            upgradeSpec.limit = 1;
        }
    }

    return upgradeSpec;
}


//TODO: make range optional or make a separate melee pattern
//const weaponRegex = /(\w+ ?\w+) \(\d{1,2}", A(\d{1,2})(?:, [\w\(\)]+)*\) \+(\d+)pts$/;

//const weaponRegex = /(\w+ ?\w+) \(\d{1,2}", A(\d{1,2})\) \+(\d+)pts$/;
/**
 * (\w+ ?\w+) - capturing group for a one-or-two-word name (optional space)
 * (\d{1,2}) - capturing group to match a one or two digit range
 * (?:"|”) - non-capturing group to match either double quotes or fancy quotes
 * , A(\d{1,2}) - captures a one or two digit number of attacks
 *  \+(\d{1,3})pts - captures the number part of the points
 */
const weaponRegex = /(\w+ ?\w+) \((?:(\d{1,2})(?:"|”), )?A(\d{1,2})\) \+(\d{1,3})pts$/;

function parseUpgrade(stringToParse) {
    const pattern = stringToParse.match(weaponRegex);
    console.log(pattern);

    const name = pattern[1];
    const range = parseInt(pattern[2], 10);

    return {
        name,
        range: isNaN(range) ? 'melee' : range,
        attacks: parseInt(pattern[3], 10),
        rules: [],
        cost: parseInt(pattern[4], 10)
    };
}

module.exports = {
    parseGroup,
    parseUpgrade
};
