# Flood-Miner
A vein miner analog for Minecraft Bedrock (1.16). If you aren't familiar with vein miner, it allows the player to mine connected blocks of the same block type with a single action. So instead of mining each individual coal ore block out of a vein of 15, the player could instead mine one and have the rest automatically broken.

**World needs to have experimental features enabled, cheats on, and behavior pack included in order to function.**

Step one: Craft World Essence
- Combine dirt, gravel, sand, a coal block, iron ore, stone, andesite, granite, and diorite in a crafting bench to create a World Essence item. This is a shapeless recipe.
Step two: Craft flood gem
- Surround the World Essence item with 8 iron in a crafting bench to craft an Inactive Flood Gem.
Step three: Activate, then mine
- Put the gem in your hand and right click to convert it to the active version. Using it again will convert it back to inactive. Mining a block with an Active Flood Gem in your **hotbar** will trigger a floodmine.

Note that you need to use the proper tool to mine the block in the first place (i.e. punching a diamond ore block to pieces will not trigger a flood mine). 

Will automatically break up to 31 connected blocks of the same type as the one that was initially destroyed. This number can be changed, but feels 'balanced' to me.

In this version of Bedrock, andesite/granite/diorite and stone are all treated as minecraft:stone blocks, so flood miner cannot distinguish between them. Perhaps in a later version they will be seperated out.

**Does not recognize fortune/silk touch and does not affect the durability of tools.**

**There is a hunger penalty applied on activation of a flood mine proportional to the number of blocks mined.**

**Single player only**
