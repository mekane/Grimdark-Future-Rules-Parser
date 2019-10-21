const expect = require('chai').expect;

const parser = require('../src/parse');

//it returns a function that makes assertions
//it auto-generates group letters(?)
//it auto-numbers the items 1,2,3

const exampleBlock = `
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
`;


describe('Parsing the group headers', () => {
    describe(`Detecting the kind of upgrade action`, () => {
        it('throws an error for unknown upgrade verbs', () => {
            const parseUnknownAction = () => parser.parseGroup('Bogus one');
            expect(parseUnknownAction).to.throw('Unknown action Bogus');
        });

        it(`translates "Replace" into removes and adds`, () => {
            const replace = parser.parseGroup('Replace one');
            expect(replace.remove).to.be.an('array');
            expect(replace.add).to.be.an('array');
        });

        it(`translates "Take" into adds`, () => {
            const take = parser.parseGroup('Take one');
            expect(take.remove).to.be.an('undefined');
            expect(take.add).to.be.an('array');
        });

        it(`translates "Upgrade with" to add equipment or rules`, () => {
            const upgrade = parser.parseGroup('Upgrade with');
            expect(upgrade.remove).to.be.an('undefined');
            expect(upgrade.add).to.be.an('array');
        });
    });

    describe(`Detecting limits and properties from the second word`, () => {
        it(`limits the upgrade to a single use if the second word is "one"`, () => {
            const replaceOne = parser.parseGroup('Replace one');
            expect(replaceOne.limit).to.equal(1);

            const takeOne = parser.parseGroup('Take one');
            expect(takeOne.limit).to.equal(1);

            const upgradeOne = parser.parseGroup('Upgrade one');
            expect(upgradeOne.limit).to.equal(1);
        });

        it(`sets the limit to one for "Replace all"`, () => {
            const replaceAll = parser.parseGroup('Replace all');
            expect(replaceAll.limit).to.equal(1);
        });

        it(`sets no limit if the second word is "any"`, () => {
            const replaceAny = parser.parseGroup('Replace any');
            expect(replaceAny.limit).to.be.an('undefined');
        });

        it(`sets the limit to X for "up to X"`, () => {
            const replaceUpToTwo = parser.parseGroup('Replace up to two');
            expect(replaceUpToTwo.limit).to.equal(2);
        });

        it(`sets the limit to one for "Upgrade all"`, () => {
            const upgradeAll = parser.parseGroup('Upgrade all');
            expect(upgradeAll.limit).to.equal(1);
        });

        it(`sets the limit to one for "Upgrade one model with:"`, () => {
            const upgradeWith = parser.parseGroup("Upgrade one model with:");
            expect(upgradeWith.limit).to.equal(1);
        });

        it(`sets the limit to one for "Upgrade with"`, () => {
            const upgradeWith = parser.parseGroup('Upgrade with');
            expect(upgradeWith.limit).to.equal(1);
        });

        it(`sets the limit to one for "Upgrade all models with any"`, () => {
            const upgradeWith = parser.parseGroup('Upgrade with');
            expect(upgradeWith.limit).to.equal(1);
        });


        it(`sets the limit to one for specific replace of one item`, () => {
            const replace1 = parser.parseGroup('Replace noun');
            expect(replace1.limit, 'Replace ___').to.equal(1);
        });

        it(`sets the limit to one for specific replace of two items`, () => {
            let replace2 = parser.parseGroup('Replace Gun and CCW');
            expect(replace2.limit, 'Replace _ and _').to.equal(1);

            replace2 = parser.parseGroup('Replace Assault Rifle and CCW');
            expect(replace2.limit, 'Replace _ _ and _').to.equal(1);

            replace2 = parser.parseGroup('Replace Assault Rifle and Storm Shield');
            expect(replace2.limit, 'Replace _ _ and _ _').to.equal(1);

            replace2 = parser.parseGroup('Replace Gun and Storm Shield');
            expect(replace2.limit, 'Replace _ and _ _').to.equal(1);
        });

        it(`sets the limit to one for specific replace of one item`, () => {
            let replace3 = parser.parseGroup('Replace Gun, Sword, and Shield');
            expect(replace3.limit, 'Replace _, _, and _').to.equal(1);

            replace3 = parser.parseGroup('Replace Assault Rifle, Sword, and Shield');
            expect(replace3.limit, 'Replace _ _, _, and _').to.equal(1);

            replace3 = parser.parseGroup('Replace Gun, Power Sword, and Shield');
            expect(replace3.limit, 'Replace _, _ _, and _').to.equal(1);

            replace3 = parser.parseGroup('Replace Gun, Sword, and Storm Shield');
            expect(replace3.limit, 'Replace _, _, and _ _').to.equal(1);

            replace3 = parser.parseGroup('Replace Assault Rifle, Sword, and Storm Shield');
            expect(replace3.limit, 'Replace _ _, _, and _ _').to.equal(1);

            replace3 = parser.parseGroup('Replace Assault Rifle, Power Sword, and Storm Shield');
            expect(replace3.limit, 'Replace _ _, _ _, and _ _').to.equal(1);
        });
    });

    describe('Some real examples', () => {
        it.skip('Correctly parses "Upgrade Psychic(1):"', () => {
            const string = "Upgrade Psychic(1):";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it('Correctly parses "Any model may replace one Razor Claws:"', () => {
            const string = "Any model may replace one Razor Claws:";
            const expected = {
                limit: 'models',
                remove: ['Razor Claws']
            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Any model may take one Energy Fist attachment:"', () => {
            const string = "Any model may take one Energy Fist attachment:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Replace all Storm Rifles and Energy Fists:"', () => {
            const string = "Replace all Storm Rifles and Energy Fists:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Replace any Assault Rifle and CCW:"', () => {
            const string = "Replace any Assault Rifle and CCW:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Replace any Razor Claws:"', () => {
            const string = "Replace any Razor Claws:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Replace one AR and CCW:"', () => {
            const string = "Replace one AR and CCW:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Replace one CCW:"', () => {
            const string = "Replace one CCW:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Replace one Pistol:"', () => {
            const string = "Replace one Pistol:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Replace Pistol:"', () => {
            const string = "Replace Pistol:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Replace up to two Pistols:"', () => {
            const string = "Replace up to two Pistols:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Replace Walker Fist and Storm Rifle:"', () => {
            const string = "Replace Walker Fist and Storm Rifle:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Replace Frost Cannon, Walker Fist and Storm Rifle:"', () => {
            const string = "Replace Frost Cannon, Walker Fist and Storm Rifle:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Take one Assault Rifle Attachment:"', () => {
            const string = "Take one Assault Rifle Attachment:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Upgrade all models with:"', () => {
            const string = "Upgrade all models with:";
            const expected = {
                limit: 1
            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Upgrade all models with any:"', () => {
            const string = "Upgrade all models with any:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Upgrade any model with:"', () => {
            const string = "Upgrade any model with:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Upgrade one model with:"', () => {
            const string = "Upgrade one model with:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Upgrade one model with one:"', () => {
            const string = "Upgrade one model with one:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Upgrade up to two models with one:"', () => {
            const string = "Upgrade up to two models with one:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Upgrade with:"', () => {
            const string = "Upgrade with:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses "Upgrade with one:"', () => {
            const string = "Upgrade with one:";
            const expected = {

            };
            expect(parser.parseGroup(string)).to.deep.equal(expected);
        });

        it.skip('Correctly parses ""', () => {});

        it.skip('Correctly parses ""', () => {});

        // Holy crap Custodian Brothers - Upgrade with Regeneration - it's flipped!
    });
});

describe('Parsing the upgrade lines', () => {
    describe('Detecting weapons', () => {

        //TODO: rework the top-level upgrade result structure so it doesn't assume weapons
        //i.e. the upgrades that are plain weapons should still return an object and put
        //the weapon(s) in an array on a weapons: property

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
                weapons: [
                    {
                        name: 'Pistol',
                        range: 12,
                        attacks: 2,
                        rules: []
                    }
                ],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a two-word name, two digit range with no special rules', () => {
            const string = "Storm Rifle (24”, A2) +15pts";
            const expected = {
                name: '',
                rules: [],
                weapons: [
                    {
                        name: 'Storm Rifle',
                        range: 24,
                        attacks: 2,
                        rules: []
                    }
                ],
                cost: 15
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a three-word name including hyphens', () => {
            const string = "Twin Heavy Bio-Carbine (18”, A6) +25pts";
            const expected = {
                name: '',
                rules: [],
                weapons: [
                    {
                        name: 'Twin Heavy Bio-Carbine',
                        range: 18,
                        attacks: 6,
                        rules: [],
                    }
                ],
                cost: 25
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a melee (no range) weapon with no special rules', () => {
            const string = "Razor Claws (A2) +10pts";
            const expected = {
                name: '',
                rules: [],
                weapons: [
                    {
                        name: 'Razor Claws',
                        range: 'melee',
                        attacks: 2,
                        rules: []
                    }
                ],
                cost: 10
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a plain text weapon rule', () => {
            const string = `Gravity Pistol (12”, A1, Rending) +5pts`;
            const expected = {
                name: '',
                rules: [],
                weapons: [
                    {
                        name: 'Gravity Pistol',
                        range: 12,
                        attacks: 1,
                        rules: ['Rending']
                    }
                ],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a weapon rule with parentheses', () => {
            const string = `Fusion Pistol (12”, A1, AP(2)) +5pts`;
            const expected = {
                name: '',
                rules: [],
                weapons: [
                    {
                        name: 'Fusion Pistol',
                        range: 12,
                        attacks: 1,
                        rules: ['AP(2)']
                    }
                ],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses multiple weapon special rules', () => {
            const string = `Fusion Pistol (12”, A1, AP(2), Rending) +5pts`;
            const expected = {
                name: '',
                rules: [],
                weapons: [
                    {
                        name: 'Fusion Pistol',
                        range: 12,
                        attacks: 1,
                        rules: ['AP(2)', 'Rending']
                    }
                ],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a lot of weapon special rules', () => {
            const string = `BFG (48”, A12, AP(2), Blast(3), Deadly(6), Indirect, Rending) +100pts`;
            const expected = {
                name: '',
                rules: [],
                weapons: [
                    {
                        name: 'BFG',
                        range: 48,
                        attacks: 12,
                        rules: ['AP(2)', 'Blast(3)', 'Deadly(6)', 'Indirect', 'Rending']
                    }
                ],
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
                rules: ['Ambush', 'Tough(+3)'],
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


        //TODO: could assert that Tough(+3) adds the Tough rule and +3 to the tough property
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
