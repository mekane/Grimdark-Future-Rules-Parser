# Language Parser

This is an experiment with a sentence parser that could be used similar to
Cucumber to turn plain sentences into code. I would like to have this for my
One Page - Grimdark Future Army Builder. I came up with a nice set of code
conventions to test the upgrade functions, but when the unit upgrades get
adjusted it's a pain to adjust all the tests too since they require some manual
setup of the actual and expected conditions. Being able to just type in the
sentences and have the tests assemble themselves out of that would be great.

## TODO

   * Parse units into army definition data structure
   * Parse whole upgrade section
   * Open a pdf and parse it - this would allow easier testing of upgrades to the lists

/*
These are from an FAQ:

When replacing weapons what's the difference between replace one/any/all/up to X?

If the list says "replace one weapon", then only one model can replace its weapon, and you have to pay the cost for that model.
If the list says "replace any weapon", then as many models as you want can replace their weapons, and you pay the cost for each model that did.
If the list says "replace all weapons", then all models must replace their weapon, and you pay the cost only once for all models.
If the list says "replace up to X weapon", then up to X models can you can replace their weapons, and you pay the cost for each model that did.

When buying upgrades what's the difference between upgrade one/any/all models?

If the list says "upgrade one model", then only one model can buy the upgrade, and you have to pay the cost for that model.
If the list says "upgrade any model", then as many models as you want can buy the upgrade, and you pay the cost for each model that was upgraded.
If the list says "upgrade all models", then buying the upgrade applies it to all models, and you pay the cost only once for all models.

When buying upgrades what's the difference between upgrade with one/any/up to X?

If the list says "upgrade with one", then you can only buy one upgrade from the list.
If the list says "upgrade with any", then you can buy any upgrade once from the list.
If the list says "upgrade with up to X", then you can buy any upgrade up to X times from the list (even multiple times).

*/