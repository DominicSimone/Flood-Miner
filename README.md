# Flood-Miner
A vein miner analog for Minecraft Bedrock (Beta 1.15.0.51).

World needs to have experimental features enabled, cheats on, and behavior pack included in order to function.

Hold shift before starting to mine a block, then release shift before destroying the block to trigger a flood mine. Note that you do need the proper tool to mine the block in the first place (i.e. punching a diamond ore block will not trigger a flood mine). Will automatically break up to 31 connected blocks of the same type as the one that was initially destroyed. This number can be changed, but feels 'balanced' to me.

In this version of Bedrock, andesite/granite/diorite and stone are all treated as minecraft:stone blocks, so flood miner cannot distinguish between them. Perhaps in a later version they will be seperated out.
