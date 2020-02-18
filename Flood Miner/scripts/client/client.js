/*
Important notes: This is made for Bedrock 1.15 beta
World creation: Experimental features ON, cheats ON, include the Flood Miner behavior pack

Sneak before you start mining a block, and unsneak before destroying a block to trigger flood mining.
*/

var clientSystem = client.registerSystem(0, 0)

var sneakOnStart = false;
var sneakOnEnd = false;
var debug = false;

clientSystem.initialize = function () {
    //Client can't listen to these events directly (player started destroying block, player destroyed block, etc)
    //so we need to have the server side script notify this one when they do happen
    //Server side script can't check if the player is sneaking, this is why we need the client side script to handle that logic
    this.listenForEvent("floodminer:blockbreaking", (eventData) => this.blockBreakingResponse(eventData))
    this.listenForEvent("floodminer:blockbroken", (eventData) => this.blockBrokenResponse(eventData))
    this.listenForEvent("floodminer:stoppedmining", (eventData) => this.stoppedMiningResponse(eventData))

    //Server side script can execute commands on the world, so if conditions are correct, we need the server to initiate the flood mine
    this.registerEventData("floodminer:floodmine", {block_position: null, block_identifier: null, player:null})
}

clientSystem.blockBreakingResponse = function(eventData){
    let molang = this.getComponent(eventData.data.player, "minecraft:molang")
    sneakOnStart = molang.data["variable.is_sneaking"]
}

clientSystem.blockBrokenResponse = function(eventData){

    let molang = this.getComponent(eventData.data.player, "minecraft:molang")
    sneakOnEnd = molang.data["variable.is_sneaking"]

    if(sneakOnStart && !sneakOnEnd){
        if(debug){
            let chatEventData = this.createEventData("minecraft:display_chat_event")
            chatEventData.data.message = "Flood mining active! Target: " + eventData.data.block_identifier
            this.broadcastEvent("minecraft:display_chat_event", chatEventData)
        }

        let floodmineRequestData = this.createEventData("floodminer:floodmine")
        floodmineRequestData.data.block_position = eventData.data.block_position
        floodmineRequestData.data.block_identifier = eventData.data.block_identifier
        floodmineRequestData.data.player = eventData.data.player
        this.broadcastEvent("floodminer:floodmine", floodmineRequestData)
    }
}

clientSystem.stoppedMiningResponse = function(eventData){
    sneakOnStart = false;
    sneakOnEnd = false;
}