const expect = require('chai').expect;

const parser = require('../src/parse');

//it returns a function that makes assertions
//it auto-generates group letters(?)
//it auto-numbers the items 1,2,3

describe('Parsing unit definitions', () => {
    it('handles malformed string gracefully', () => {
        function emptyString() { parser.parseUnit('') }
        expect(emptyString).to.throw(/missing unit name/);

        function missingModels() { parser.parseUnit('Name') }
        expect(missingModels).to.throw(/missing model count/);

        function missingModelCount() { parser.parseUnit('Name [') }
        expect(missingModelCount).to.throw(/invalid number of models/);

        function missingModelEndBracket() { parser.parseUnit('Name [2') }
        expect(missingModelEndBracket).to.throw(/invalid number of models/);

        function invalidModelCount() { parser.parseUnit('Name [x]') }
        expect(invalidModelCount).to.throw(/invalid number of models/);

        function missingQuality() { parser.parseUnit('Name [1]') }
        expect(missingQuality).to.throw(/invalid quality/);

        function invalidQuality() { parser.parseUnit('Name [1] q+') }
        expect(invalidQuality).to.throw(/invalid quality/);

        function missingDefense() { parser.parseUnit('Name [1] 2+') }
        expect(missingDefense).to.throw(/invalid defense/);

        function invalidDefense() { parser.parseUnit('Name [1] 2+ d+') }
        expect(invalidDefense).to.throw(/invalid defense/);

        function missingPoints() { parser.parseUnit('Name [1] 2+ 2+ Hero -') }
        expect(missingPoints).to.throw(/invalid points/);

        function invalidWeapons() { parser.parseUnit('Name [1] 2+ 2+ Garbage Hero - 10pts') }
        expect(invalidWeapons).to.throw(/invalid weapons/);
    });

    it('returns a data structure with basic unit properties', () => {
        const unit = parser.parseUnit("Dude [1] 3+ 2+ Hero - 100pts");

        expect(unit).to.be.an('object');
        expect(unit.name).to.be.a('string');
        expect(unit.models).to.be.a('number');
        expect(unit.quality).to.be.a('number');
        expect(unit.defense).to.be.a('number');
        expect(unit.equipment).to.be.an('array');
        expect(unit.rules).to.be.an('array');
        expect(unit.upgrades).to.be.an('array');
    });

    it('gets unit name from the first token(s)', () => {
        const oneTokenName = 'Dude [1] 6+ 6+ Hero - 10pts';
        const twoTokenName = 'Some Guy [1] 6+ 6+ Hero - 10pts';
        const threeTokenName = 'The Best One [1] 6+ 6+ Hero - 10pts';

        expect(parser.parseUnit(oneTokenName).name).to.equal('Dude');
        expect(parser.parseUnit(twoTokenName).name).to.equal('Some Guy');
        expect(parser.parseUnit(threeTokenName).name).to.equal('The Best One');
    });

    it('parses number of models from the square brackets following name', () => {
        const oneModel = 'Dude [1] 6+ 6+ Hero - 10pts';
        expect(parser.parseUnit(oneModel).models).to.equal(1);

        const threeModels = 'Some Guys [3] 6+ 6+ Hero - 10pts';
        expect(parser.parseUnit(threeModels).models).to.equal(3);

        const manyModels = 'Many Guys [11] 6+ 6+ Hero - 10pts';
        expect(parser.parseUnit(manyModels).models).to.equal(11);
    });

    it('gets quality from the token following models', () => {
        const qualityTwo = 'Guy [1] 2+ 6+ Hero - 10pts';
        expect(parser.parseUnit(qualityTwo).quality).to.equal(2);

        const qualityThree = 'Guy [1] 3+ 6+ Hero - 10pts';
        expect(parser.parseUnit(qualityThree).quality).to.equal(3);
    });

    it('gets defense from the token following quality', () => {
        const defenseTwo = 'Guy [1] 6+ 2+ Hero - 10pts';
        expect(parser.parseUnit(defenseTwo).defense).to.equal(2);

        const defenseThree = 'Guy [1] 2+ 3+ Hero - 10pts';
        expect(parser.parseUnit(defenseThree).defense).to.equal(3);
    });

    it('gets points cost from last token', () => {
        const oneHundredPoints = 'Guy [1] 6+ 2+ Hero - 100pts';
        expect(parser.parseUnit(oneHundredPoints).points).to.equal(100);

        const twoHundredPoints = 'Guy [1] 6+ 2+ Hero - 200pts';
        expect(parser.parseUnit(twoHundredPoints).points).to.equal(200);
    });

    it('gets available upgrades by working backwards from points until it hits a rule', () => {
        const noUpgrades = 'Guy [1] 6+ 2+ Hero - 100pts';
        expect(parser.parseUnit(noUpgrades).upgrades).to.deep.equal([]);

        const oneUpgrade = 'Guy [1] 6+ 2+ Hero A 100pts';
        expect(parser.parseUnit(oneUpgrade).upgrades).to.deep.equal(['A']);

        const twoUpgrade = 'Guy [1] 6+ 2+ Hero A, B 100pts';
        expect(parser.parseUnit(twoUpgrade).upgrades).to.deep.equal(['A', 'B']);
    });

    it('gets works backwards to get rule names', () => {
        const oneRule = 'Guy [1] 6+ 2+ Hero - 100pts';
        expect(parser.parseUnit(oneRule).rules).to.deep.equal(['Hero']);

        const twoRules = 'Guy [1] 6+ 2+ Fearless Hero A 100pts';
        expect(parser.parseUnit(twoRules).rules).to.deep.equal(['Fearless', 'Hero']);

        const rulesWithX = 'Guy [1] 6+ 2+ Fearless, Slow, Tough(6) A, B 100pts';
        expect(parser.parseUnit(rulesWithX).rules).to.deep.equal(['Fearless', 'Slow', 'Tough(6)']);
    });

    it('parses the (X) values into the properties on the units');

    it('parses a weapon definition from the remaining tokens', () => {
        const grunt = "Grunt [1] 5+ 6+ Rifle (24”, A1) Slow A, B 20pts";
        const parsedGrunt = parser.parseUnit(grunt);

        expect(parsedGrunt).to.deep.equal({
            name: 'Grunt',
            models: 1,
            quality: 5,
            defense: 6,
            equipment: [
                { name: 'Rifle', range: 24, attacks: 1, rules: [] }
            ],
            rules: ['Slow'],
            upgrades: ['A', 'B'],
            points: 20
        });

        const captain = "Captain [1] 3+ 2+ Assault Rifle (24”, A2), CCW (A1, Rending) Hero, Tough(3) A, B, C 110pts";
        const parsedCaptain = parser.parseUnit(captain);
        expect(parsedCaptain).to.deep.equal({
            name: 'Captain',
            models: 1,
            quality: 3,
            defense: 2,
            equipment: [
                { name: 'Assault Rifle', range: 24, attacks: 2, rules: [] },
                { name: 'CCW', range: 'melee', attacks: 1, rules: ['Rending'] }
            ],
            rules: ['Hero', 'Tough(3)'],
            upgrades: ['A', 'B', 'C'],
            points: 110
        });
    });
});

//TODO: another module that turns all of these data structures into output. It would wrap e.g. units in the
// const UnitName = () => ({ ... JSON ... });

describe('Parsing the upgrade group headers', () => {
    describe(`Detecting limits and properties from the second word`, () => {
        it(`limits the upgrade to a single use if the second word is "one"`, () => {
            const replaceOne = parser.parseUpgradeGroup('Replace one');
            expect(replaceOne.limit).to.equal(1);

            const takeOne = parser.parseUpgradeGroup('Take one');
            //expect(takeOne.limit).to.equal(1);

            const upgradeOne = parser.parseUpgradeGroup('Upgrade one');
            //expect(upgradeOne.limit).to.equal(1);
        });

        it(`sets the limit to one for "Replace all"`, () => {
            const replaceAll = parser.parseUpgradeGroup('Replace all');
            expect(replaceAll.limit).to.equal(1);
        });

        it(`sets the limit to X for "up to X"`, () => {
            const replaceUpToTwo = parser.parseUpgradeGroup('Replace up to three');
            expect(replaceUpToTwo.limit).to.equal(3);
        });

        it(`sets the limit to one for "Upgrade one model with:"`, () => {
            const upgradeWith = parser.parseUpgradeGroup("Upgrade one model with:");
            expect(upgradeWith.limit).to.equal(1);
        });

        it(`sets the limit to one for "Upgrade with:"`, () => {
            const upgradeWith = parser.parseUpgradeGroup('Upgrade with:');
            expect(upgradeWith.limit).to.equal(1);
        });

        it(`sets no limit for "Upgrade all models with any:"`, () => {
            //Note: I think an upgrade with this header and multiple options should not have an upgrade-level limit
            //since you could add each option. But each option should only be able to be added once (right?). How to
            //enforce that case?
            const upgradeWith = parser.parseUpgradeGroup('Upgrade all models with any:');
            expect(upgradeWith.limit).to.be.an('undefined');
        });
    });
});

describe('Parsing "Replace" upgrade headers', () => {
    describe('Parsing "Replace all/any" with one, two, or three weapons', () => {
        it(`correctly parses replacement of one item, no spaces`, () => {
            const replace = parser.parseUpgradeGroup('Replace CCW:');
            const expected = {
                limit: 1,
                replace: ['CCW']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of one item, with spaces`, () => {
            const replace = parser.parseUpgradeGroup('Replace Assault Rifle:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of two items, no spaces`, () => {
            let replace = parser.parseUpgradeGroup('Replace Gun and CCW:');
            const expected = {
                limit: 1,
                replace: ['Gun', 'CCW']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of two items, first one with spaces`, () => {
            const replace = parser.parseUpgradeGroup('Replace Assault Rifle and CCW:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle', 'CCW']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of two items, both with spaces`, () => {

            const replace = parser.parseUpgradeGroup('Replace Assault Rifle and Storm Shield:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle', 'Storm Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of two items, second one with spaces`, () => {
            const replace = parser.parseUpgradeGroup('Replace Gun and Storm Shield:');
            const expected = {
                limit: 1,
                replace: ['Gun', 'Storm Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, no spaces`, () => {
            const replace = parser.parseUpgradeGroup('Replace Gun, Sword and Shield:');
            const expected = {
                limit: 1,
                replace: ['Gun', 'Sword', 'Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, first spaces`, () => {
            const replace = parser.parseUpgradeGroup('Replace Assault Rifle, Sword, and Shield:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle', 'Sword', 'Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, first two spaces`, () => {
            const replace = parser.parseUpgradeGroup('Replace Gun, Power Sword, and Shield:');
            const expected = {
                limit: 1,
                replace: ['Gun', 'Power Sword', 'Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, second two spaces`, () => {
            const replace = parser.parseUpgradeGroup('Replace Gun, Sword, and Storm Shield:');
            const expected = {
                limit: 1,
                replace: ['Gun', 'Sword', 'Storm Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, outer two spaces`, () => {
            const replace = parser.parseUpgradeGroup('Replace Assault Rifle, Sword, and Storm Shield:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle', 'Sword', 'Storm Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, all three spaces`, () => {
            const replace = parser.parseUpgradeGroup('Replace Assault Rifle, Power Sword, and Storm Shield:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle', 'Power Sword', 'Storm Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        //todo: add similar cases for "all" (and "any"? )
    });

    it('Correctly parses "Any model may replace one Razor Claws:"', () => {
        const string = "Any model may replace one Razor Claws:";
        const expected = {
            limit: 'models',
            replace: ['Razor Claws']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace all Storm Rifles and Energy Fists:"', () => {
        const string = "Replace all Storm Rifles and Energy Fists:";
        const expected = {
            limit: 1,
            replaceAll: ['Storm Rifle', 'Energy Fist']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace any Assault Rifle and CCW:"', () => {
        const string = "Replace any Assault Rifle and CCW:";
        const expected = {
            replace: ['Assault Rifle', 'CCW']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace any Razor Claws:"', () => {
        const string = "Replace any Razor Claws:";
        const expected = {
            replace: ['Razor Claws']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace one AR and CCW:"', () => {
        const string = "Replace one AR and CCW:";
        const expected = {
            limit: 1,
            replace: ['AR', 'CCW']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace one CCW:"', () => {
        const string = "Replace one CCW:";
        const expected = {
            limit: 1,
            replace: ['CCW']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace one Pistol:"', () => {
        const string = "Replace one Pistol:";
        const expected = {
            limit: 1,
            replace: ['Pistol']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace Pistol:"', () => {
        const string = "Replace Pistol:";
        const expected = {
            limit: 1,
            replace: ['Pistol']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace Assault Rifle:"', () => {
        const string = "Replace Assault Rifle:";
        const expected = {
            limit: 1,
            replace: ['Assault Rifle']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace up to two Pistols:"', () => {
        const string = "Replace up to two Pistols:";
        const expected = {
            limit: 2,
            replace: ['Pistol']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace Walker Fist and Storm Rifle:"', () => {
        const string = "Replace Walker Fist and Storm Rifle:";
        const expected = {
            limit: 1,
            replace: ['Walker Fist', 'Storm Rifle']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace Frost Cannon, Walker Fist and Storm Rifle:"', () => {
        const string = "Replace Frost Cannon, Walker Fist and Storm Rifle:";
        const expected = {
            limit: 1,
            replace: ['Frost Cannon', 'Walker Fist', 'Storm Rifle']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });
});

describe('Parsing "Take" upgrade headers', () => {
    it('Correctly parses "Any model may take one Energy Fist attachment:"', () => {
        const string = "Any model may take one Energy Fist attachment:";
        const expected = {
            limit: 'models with Energy Fist', //Will need to be implemented in the upgrade function
            require: ['Energy Fist']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Take one Assault Rifle Attachment:"', () => {
        const string = "Take one Assault Rifle Attachment:";
        const expected = {
            limit: 1,
            require: ['Assault Rifle']
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });
    //TODO: more cases for "Take":
    //   * multiple items (and)
    //   * other limits
});

describe('Parsing "Upgrade" upgrade headers', () => {
    it.skip('Correctly parses "Upgrade all models with:"', () => {
        const string = "Upgrade all models with:";
        const expected = {
            limit: 1
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade all models with any:"', () => {
        const string = "Upgrade all models with any:";
        const expected = {};
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade any model with:"', () => {
        const string = "Upgrade any model with:";
        const expected = {};
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade one model with:"', () => {
        const string = "Upgrade one model with:";
        const expected = {};
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade one model with one:"', () => {
        const string = "Upgrade one model with one:";
        const expected = {};
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade up to two models with one:"', () => {
        const string = "Upgrade up to two models with one:";
        const expected = {};
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade with:"', () => {
        const string = "Upgrade with:";
        const expected = {};
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade with one:"', () => {
        const string = "Upgrade with one:";
        const expected = {};
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade Psychic(1):"', () => {
        const string = "Upgrade Psychic(1):";
        const expected = {
            requiresRule: ['Psychic'],
            requiresPropertyValue: {
                'psychic': 1
            }
        };
        expect(parser.parseUpgradeGroup(string)).to.deep.equal(expected);
    });
});

describe('Parsing the upgrade lines', () => {
    describe('Detecting weapons', () => {
        it('returns a data structure of Weapon Name, attacks, rules, and point cost', () => {
            const string = `Pistol (6", A1) +5pts`;
            const result = parser.parseUpgrade(string);

            expect(result).to.be.an('object');
            expect(result.name).to.be.a('string');
            expect(result.rules).to.be.an('array');
            expect(result.weapons).to.be.an('array');
            expect(result.cost).to.be.a('number');

            const weapon = result.weapons[0];
            expect(weapon.name).to.be.a('string');
            expect(weapon.range).to.be.a('number');
            expect(weapon.attacks).to.be.a('number');
        });

        it('parses a one-word name, two digit range with no special rules', () => {
            const string = "Pistol (12”, A2) +5pts";
            const expected = {
                name: '',
                rules: [],
                weapons: [{
                    name: 'Pistol',
                    range: 12,
                    attacks: 2,
                    rules: []
                }],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a two-word name, two digit range with no special rules', () => {
            const string = "Storm Rifle (24”, A2) +15pts";
            const expected = {
                name: '',
                rules: [],
                weapons: [{
                    name: 'Storm Rifle',
                    range: 24,
                    attacks: 2,
                    rules: []
                }],
                cost: 15
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a three-word name including hyphens', () => {
            const string = "Twin Heavy Bio-Carbine (18”, A6) +25pts";
            const expected = {
                name: '',
                rules: [],
                weapons: [{
                    name: 'Twin Heavy Bio-Carbine',
                    range: 18,
                    attacks: 6,
                    rules: [],
                }],
                cost: 25
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a melee (no range) weapon with no special rules', () => {
            const string = "Razor Claws (A2) +10pts";
            const expected = {
                name: '',
                rules: [],
                weapons: [{
                    name: 'Razor Claws',
                    range: 'melee',
                    attacks: 2,
                    rules: []
                }],
                cost: 10
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a plain text weapon rule', () => {
            const string = `Gravity Pistol (12”, A1, Rending) +5pts`;
            const expected = {
                name: '',
                rules: [],
                weapons: [{
                    name: 'Gravity Pistol',
                    range: 12,
                    attacks: 1,
                    rules: ['Rending']
                }],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a weapon rule with parentheses', () => {
            const string = `Fusion Pistol (12”, A1, AP(2)) +5pts`;
            const expected = {
                name: '',
                rules: [],
                weapons: [{
                    name: 'Fusion Pistol',
                    range: 12,
                    attacks: 1,
                    rules: ['AP'],
                    ap: 2
                }],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses multiple weapon special rules', () => {
            const string = `Fusion Pistol (12”, A1, AP(2), Rending) +5pts`;
            const expected = {
                name: '',
                rules: [],
                weapons: [{
                    name: 'Fusion Pistol',
                    range: 12,
                    attacks: 1,
                    rules: ['AP', 'Rending'],
                    ap: 2
                }],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a lot of weapon special rules', () => {
            const string = `BFG (48”, A12, AP(2), Blast(3), Deadly(6), Indirect, Rending) +100pts`;
            const expected = {
                name: '',
                rules: [],
                weapons: [{
                    name: 'BFG',
                    range: 48,
                    attacks: 12,
                    rules: ['AP', 'Blast', 'Deadly', 'Indirect', 'Rending'],
                    ap: 2,
                    blast: 3,
                    deadly: 6
                }],
                cost: 100
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });
    });

    describe(`Detecting rules that don't match a weapon spec`, () => {
        it(`assumes a rule name (or text) and a point cost`, () => {
            const string = `Transport Spore +20pts`;
            const expected = {
                name: 'Transport Spore',
                rules: [], //TODO: special case to put the name in the rules here
                weapons: [],
                cost: 20
            };

            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it(`parses a rule name from parentheses`, () => {
            const string = `Adrenaline (Furious) +5pts`;
            const expected = {
                name: 'Adrenaline',
                rules: ['Furious'],
                weapons: [],
                cost: 5
            };

            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it(`parses other text a rule text (including parens) from parentheses`, () => {
            const string = `Acid Bite (AP(+1) in melee) +5pts`;
            const expected = {
                name: 'Acid Bite',
                rules: ['AP(+1) in melee'],
                weapons: [],
                cost: 5
            };

            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it(`parses multiple rules from parentheses`, () => {
            const string = `Destroyer Armor (Ambush, Tough(+3)) +70pts`;
            const expected = {
                name: 'Destroyer Armor',
                rules: ['Ambush', 'Tough'],
                tough: 3,
                weapons: [],
                cost: 70
            };

            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it(`parses weapons from parentheses`, () => {
            const string = `Bike (Fast, Twin Assault Rifle (24”, A2)) +70pts`;
            const expected = {
                name: 'Bike',
                rules: ['Fast'],
                weapons: [{
                    name: 'Twin Assault Rifle',
                    range: 24,
                    attacks: 2,
                    rules: []
                }],
                cost: 70
            };

            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses numeric values into property values for rules that have a number', () => {
            const string = 'Battering Tusks (Impact(6)) +20pts';

            const expected = {
                name: 'Battering Tusks',
                rules: ['Impact'],
                impact: 6,
                weapons: [],
                cost: 20
            };

            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });
    });
});

describe('Tokenizing lists by splitting on ",", but not inside ()', () => {
    it('returns an array of tokens broken up by commas', () => {
        const testString = "Token one,Token two,Token three";
        const expected = ['Token one', 'Token two', 'Token three'];

        expect(parser.splitByCommas(testString)).to.deep.equal(expected);
    });

    it('trims whitespace from the individual tokens', () => {
        const testString = " Token one , Token two , Token three ";
        const expected = ['Token one', 'Token two', 'Token three'];

        expect(parser.splitByCommas(testString)).to.deep.equal(expected);
    });

    it('ignores empty tokens (filters them out)', () => {
        const testString = ", Token one, Token two, Token three, ,";
        const expected = ['Token one', 'Token two', 'Token three'];

        expect(parser.splitByCommas(testString)).to.deep.equal(expected);
    });

    it('does not split by commas that are inside parentheses', () => {
        const testString = "Name, Age, (Address, Street, Zip)";
        const expected = ['Name', 'Age', '(Address, Street, Zip)'];

        expect(parser.splitByCommas(testString)).to.deep.equal(expected);
    });
});

describe.skip('Parsing blocks of upgrade text', () => {

    const simpleUpgradeText = `
A
Replace one:
Pistol (12”, A1) and CCW (A2) +5pts
`;

    it('parses a simple block', () => {
        const actual = parser.parseUpgradeSection(simpleUpgradeText);

        const expected = {
            A: {
                '1': {
                    description: 'Replace one',
                    limit: 1,
                    upgrades: [{
                        name: 'Pistol',
                        weapons: [{

                            },
                            {}
                        ],
                        cost: 5
                    }]
                }
            }
        };

        expect(actual).to.deep.equal(expected);
    });

    const upgradeTextBlock = `
A
Replace one Assault Rifle and CCW:
    Pistol (12”, A1) and CCW (A2) Free
Replace one Pistol:
    Gravity Pistol (12”, A1, Rending) +5pts
    Plasma Pistol (12”, A1, AP(2)) +5pts
    Storm Rifle (24”, A2) +5pts
Replace one CCW:
    Energy Sword (A2, AP(1)) +5pts
    Energy Fist (A2, AP(2)) +10pts
Take one Assault Rifle attachment:
    Gravity Rifle (18”, A1, Rending) +10pts
    Plasma Rifle (24”, A1, AP(2)) +15pts
    Flamethrower (12”, A6) +15pts
    Fusion Rifle (12”, A1, AP(4), Deadly(6)) +25pts
B
Upgrade with one:
    Jetpack (Ambush, Flying)    +15pts
    Combat Bike (Fast, Impact(1),Twin Assault Rifle (24”,A2))   +2-pts
    Destroyer Armor (Ambush, Tough(+3)) +70pts
Upgrade with:
    Veteran Infantry    +15pts
`;

    it('parses a more complex block', () => {
        const actual = parser.parseUpgradeSection(upgradeTextBlock);

        const expectedUpgradeGroupKeys = ['description', 'max', 'upgrades'];

        expect(actual).to.be.an('object');
        expect(actual['A']).to.be.an('object');
        expect(actual['B']).to.be.an('object');

        const A = actual('A');
        expect(A['1']).to.be.an('object').and.to.have.all.keys(expectedUpgradeGroupKeys);
        expect(A['2']).to.be.an('object').and.to.have.all.keys(expectedUpgradeGroupKeys);
        expect(A['3']).to.be.an('object').and.to.have.all.keys(expectedUpgradeGroupKeys);
        expect(A['4']).to.be.an('object').and.to.have.all.keys(expectedUpgradeGroupKeys);

        const B = actual('B');
        expect(B['1']).to.be.an('object').and.to.have.all.keys(expectedUpgradeGroupKeys);
        expect(B['2']).to.be.an('object').and.to.have.all.keys(expectedUpgradeGroupKeys);

        //returns an object with keys for the upgrade groups
        // each of which is an object that has numeric keys for objects that each have:
        //      description (header)
        //      max (limit)
        //      upgrades: an array of objects, each of which is the upgrade information
        //          cost
        //          upgrade function
        expect(actual).to();
    });
});
