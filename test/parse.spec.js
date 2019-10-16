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
`


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
        it.skip('Correctly parses "Any model may replace one Razor Claws:"', () => {

        });

        it.skip('Correctly parses "Any model may take one Energy Fist attachment:"', () => {

        });

        it.skip('Correctly parses "Replace all Storm Rifles and Energy Fists:"', () => {

        });

        it.skip('Correctly parses "Replace any Assault Rifle and CCW:"', () => {

        });

        it.skip('Correctly parses "Replace any Razor Claws:"', () => {

        });

        it.skip('Correctly parses "Replace one AR and CCW:"', () => {

        });

        it.skip('Correctly parses "Replace one CCW:"', () => {

        });

        it.skip('Correctly parses "Replace one Pistol:"', () => {

        });

        it.skip('Correctly parses "Replace Pistol:"', () => {

        });

        it.skip('Correctly parses "Replace up to two Pistols:"', () => {

        });

        it.skip('Correctly parses "Replace Walker Fist and Storm Rifle:"', () => {

        });

        it.skip('Correctly parses "Replace Frost Cannon, Walker Fist and Storm Rifle:"', () => {

        });

        it.skip('Correctly parses "Take one Assault Rifle Attachment:"', () => {

        });

        it.skip('Correctly parses "Upgrade all models with:"', () => {

        });

        it.skip('Correctly parses "Upgrade all models with any:"', () => {

        });

        it.skip('Correctly parses "Upgrade any model with:"', () => {

        });

        //this appears to be synonymous with "with one", but in cases where there's only one option
        it.skip('Correctly parses "Upgrade one model with:"', () => {

        });

        it.skip('Correctly parses "Upgrade one model with one:"', () => {

        });

        it.skip('Correctly parses "Upgrade Psychic(1):"', () => {

        });

        it.skip('Correctly parses "Upgrade up to two models with one:"', () => {

        });

        it.skip('Correctly parses "Upgrade with:"', () => {

        });

        it.skip('Correctly parses "Upgrade with one:"', () => {

        });

        it.skip('Correctly parses ""', () => {

        });

        it.skip('Correctly parses ""', () => {

        });

        // Holy crap Custodian Brothers - Upgrade with Regeneration - it's flipped!
    });
});

describe('Parsing the upgrade lines', () => {
    describe('Detecting weapons', () => {
        it('returns a data structure of Weapon Name, attacks, rules, and point cost', () => {
            const string = `Pistol (6", A1) +5pts`;
            const result = parser.parseUpgrade(string);

            expect(result).to.be.an('object');
            expect(result.name).to.be.a('string');
            expect(result.range).to.be.a('number');
            expect(result.attacks).to.be.a('number');
            expect(result.rules).to.be.an('array');
            expect(result.cost).to.be.a('number');
        });

        it('parses a one-word name, two digit range with no special rules', () => {
            const string = "Pistol (12”, A2) +5pts";
            const expected = {
                name: 'Pistol',
                range: 12,
                attacks: 2,
                rules: [],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a two-word name, two digit range with no special rules', () => {
            const string = "Storm Rifle (24”, A2) +15pts";
            const expected = {
                name: 'Storm Rifle',
                range: 24,
                attacks: 2,
                rules: [],
                cost: 15
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a three-word name including hyphens', () => {
            const string = "Twin Heavy Bio-Carbine (18”, A6) +25pts";
            const expected = {
                name: 'Twin Heavy Bio-Carbine',
                range: 18,
                attacks: 6,
                rules: [],
                cost: 25
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a melee (no range) weapon with no special rules', () => {
            const string = "Razor Claws (A2) +10pts";
            const expected = {
                name: 'Razor Claws',
                range: 'melee',
                attacks: 2,
                rules: [],
                cost: 10
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a plain text weapon rule', () => {
            const string = `Gravity Pistol (12”, A1, Rending) +5pts`;
            const expected = {
                name: 'Gravity Pistol',
                range: 12,
                attacks: 1,
                rules: ['Rending'],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a weapon rule with parentheses', () => {
            const string = `Fusion Pistol (12”, A1, AP(2)) +5pts`;
            const expected = {
                name: 'Fusion Pistol',
                range: 12,
                attacks: 1,
                rules: ['AP(2)'],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses multiple weapon special rules', () => {
            const string = `Fusion Pistol (12”, A1, AP(2), Rending) +5pts`;
            const expected = {
                name: 'Fusion Pistol',
                range: 12,
                attacks: 1,
                rules: ['AP(2)', 'Rending'],
                cost: 5
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });

        it('parses a lot of weapon special rules', () => {
            const string = `BFG (48”, A12, AP(2), Blast(3), Deadly(6), Indirect, Rending) +100pts`;
            const expected = {
                name: 'BFG',
                range: 48,
                attacks: 12,
                rules: ['AP(2)', 'Blast(3)', 'Deadly(6)', 'Indirect', 'Rending'],
                cost: 100
            };
            expect(parser.parseUpgrade(string)).to.deep.equal(expected);
        });
    });

});
