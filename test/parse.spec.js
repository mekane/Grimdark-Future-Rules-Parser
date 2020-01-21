const expect = require('chai').expect;

const parser = require('../src/parse');

//it returns a function that makes assertions
//it auto-generates group letters(?)
//it auto-numbers the items 1,2,3

describe('Parsing unit definitions', () => {
    //keep track of weapon definitions, output return has of those
    //reference weapon defs by name in unit definitions
});

//TODO: another module that turns all of these data structures into output. It would wrap e.g. units in the
// const UnitName = () => ({ ... JSON ... });

describe('Parsing the upgrade group headers', () => {
    describe(`Detecting limits and properties from the second word`, () => {
        it(`limits the upgrade to a single use if the second word is "one"`, () => {
            const replaceOne = parser.parseGroup('Replace one');
            expect(replaceOne.limit).to.equal(1);

            const takeOne = parser.parseGroup('Take one');
            //expect(takeOne.limit).to.equal(1);

            const upgradeOne = parser.parseGroup('Upgrade one');
            //expect(upgradeOne.limit).to.equal(1);
        });

        it(`sets the limit to one for "Replace all"`, () => {
            const replaceAll = parser.parseGroup('Replace all');
            expect(replaceAll.limit).to.equal(1);
        });

        it(`sets the limit to X for "up to X"`, () => {
            const replaceUpToTwo = parser.parseGroup('Replace up to three');
            expect(replaceUpToTwo.limit).to.equal(3);
        });

        it(`sets the limit to one for "Upgrade one model with:"`, () => {
            const upgradeWith = parser.parseGroup("Upgrade one model with:");
            expect(upgradeWith.limit).to.equal(1);
        });

        it(`sets the limit to one for "Upgrade with:"`, () => {
            const upgradeWith = parser.parseGroup('Upgrade with:');
            expect(upgradeWith.limit).to.equal(1);
        });

        it(`sets no limit for "Upgrade all models with any:"`, () => {
            //Note: I think an upgrade with this header and multiple options should not have an upgrade-level limit
            //since you could add each option. But each option should only be able to be added once (right?). How to
            //enforce that case?
            const upgradeWith = parser.parseGroup('Upgrade all models with any:');
            expect(upgradeWith.limit).to.be.an('undefined');
        });
    });
});

describe('Parsing "Replace" upgrade headers', () => {
    describe('Parsing "Replace all/any" with one, two, or three weapons', () => {
        it(`correctly parses replacement of one item, no spaces`, () => {
            const replace = parser.parseGroup('Replace CCW:');
            const expected = {
                limit: 1,
                replace: ['CCW']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of one item, with spaces`, () => {
            const replace = parser.parseGroup('Replace Assault Rifle:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of two items, no spaces`, () => {
            let replace = parser.parseGroup('Replace Gun and CCW:');
            const expected = {
                limit: 1,
                replace: ['Gun', 'CCW']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of two items, first one with spaces`, () => {
            const replace = parser.parseGroup('Replace Assault Rifle and CCW:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle', 'CCW']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of two items, both with spaces`, () => {

            const replace = parser.parseGroup('Replace Assault Rifle and Storm Shield:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle', 'Storm Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of two items, second one with spaces`, () => {
            const replace = parser.parseGroup('Replace Gun and Storm Shield:');
            const expected = {
                limit: 1,
                replace: ['Gun', 'Storm Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, no spaces`, () => {
            const replace = parser.parseGroup('Replace Gun, Sword and Shield:');
            const expected = {
                limit: 1,
                replace: ['Gun', 'Sword', 'Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, first spaces`, () => {
            const replace = parser.parseGroup('Replace Assault Rifle, Sword, and Shield:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle', 'Sword', 'Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, first two spaces`, () => {
            const replace = parser.parseGroup('Replace Gun, Power Sword, and Shield:');
            const expected = {
                limit: 1,
                replace: ['Gun', 'Power Sword', 'Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, second two spaces`, () => {
            const replace = parser.parseGroup('Replace Gun, Sword, and Storm Shield:');
            const expected = {
                limit: 1,
                replace: ['Gun', 'Sword', 'Storm Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, outer two spaces`, () => {
            const replace = parser.parseGroup('Replace Assault Rifle, Sword, and Storm Shield:');
            const expected = {
                limit: 1,
                replace: ['Assault Rifle', 'Sword', 'Storm Shield']
            };
            expect(replace).to.deep.equal(expected);
        });

        it(`correctly parses replacement of three items, all three spaces`, () => {
            const replace = parser.parseGroup('Replace Assault Rifle, Power Sword, and Storm Shield:');
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
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace all Storm Rifles and Energy Fists:"', () => {
        const string = "Replace all Storm Rifles and Energy Fists:";
        const expected = {
            limit: 1,
            replaceAll: ['Storm Rifle', 'Energy Fist']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace any Assault Rifle and CCW:"', () => {
        const string = "Replace any Assault Rifle and CCW:";
        const expected = {
            replace: ['Assault Rifle', 'CCW']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace any Razor Claws:"', () => {
        const string = "Replace any Razor Claws:";
        const expected = {
            replace: ['Razor Claws']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace one AR and CCW:"', () => {
        const string = "Replace one AR and CCW:";
        const expected = {
            limit: 1,
            replace: ['AR', 'CCW']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace one CCW:"', () => {
        const string = "Replace one CCW:";
        const expected = {
            limit: 1,
            replace: ['CCW']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace one Pistol:"', () => {
        const string = "Replace one Pistol:";
        const expected = {
            limit: 1,
            replace: ['Pistol']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace Pistol:"', () => {
        const string = "Replace Pistol:";
        const expected = {
            limit: 1,
            replace: ['Pistol']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace Assault Rifle:"', () => {
        const string = "Replace Assault Rifle:";
        const expected = {
            limit: 1,
            replace: ['Assault Rifle']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace up to two Pistols:"', () => {
        const string = "Replace up to two Pistols:";
        const expected = {
            limit: 2,
            replace: ['Pistol']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace Walker Fist and Storm Rifle:"', () => {
        const string = "Replace Walker Fist and Storm Rifle:";
        const expected = {
            limit: 1,
            replace: ['Walker Fist', 'Storm Rifle']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Replace Frost Cannon, Walker Fist and Storm Rifle:"', () => {
        const string = "Replace Frost Cannon, Walker Fist and Storm Rifle:";
        const expected = {
            limit: 1,
            replace: ['Frost Cannon', 'Walker Fist', 'Storm Rifle']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });
});

describe('Parsing "Take" upgrade headers', () => {
    it('Correctly parses "Any model may take one Energy Fist attachment:"', () => {
        const string = "Any model may take one Energy Fist attachment:";
        const expected = {
            limit: 'models with Energy Fist', //Will need to be implemented in the upgrade function
            require: ['Energy Fist']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it('Correctly parses "Take one Assault Rifle Attachment:"', () => {
        const string = "Take one Assault Rifle Attachment:";
        const expected = {
            limit: 1,
            require: ['Assault Rifle']
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
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
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade all models with any:"', () => {
        const string = "Upgrade all models with any:";
        const expected = {};
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade any model with:"', () => {
        const string = "Upgrade any model with:";
        const expected = {};
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade one model with:"', () => {
        const string = "Upgrade one model with:";
        const expected = {};
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade one model with one:"', () => {
        const string = "Upgrade one model with one:";
        const expected = {};
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade up to two models with one:"', () => {
        const string = "Upgrade up to two models with one:";
        const expected = {};
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade with:"', () => {
        const string = "Upgrade with:";
        const expected = {};
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade with one:"', () => {
        const string = "Upgrade with one:";
        const expected = {};
        expect(parser.parseGroup(string)).to.deep.equal(expected);
    });

    it.skip('Correctly parses "Upgrade Psychic(1):"', () => {
        const string = "Upgrade Psychic(1):";
        const expected = {
            requiresRule: ['Psychic'],
            requiresPropertyValue: {
                'psychic': 1
            }
        };
        expect(parser.parseGroup(string)).to.deep.equal(expected);
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

describe('Parsing blocks of upgrade text', () => {

    const simpleUpgradeText = `
A
Replace one:
Pistol (12”, A1) and CCW (A2) +5pts
`;

    it('parses a simple block', () => {
        const actual = parser.parseText(simpleUpgradeText);

        const expected = {
             A: {
                 '1': {
                     description: 'Replace one',
                     limit: 1,
                     upgrades: [
                         {
                             name: 'Pistol',
                             weapons: [
                                 {

                                 },
                                 {}
                             ],
                             cost: 5
                         }
                     ]
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
        const actual = parser.parseText(upgradeTextBlock);

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

