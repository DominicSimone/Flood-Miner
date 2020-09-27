/*
Important notes: This is made for Bedrock 1.16
World creation: Experimental features ON, cheats ON, include the Flood Miner behavior pack
*/

var serverSystem = server.registerSystem(0, 0);

var maxFloodSize = 32 - 1;
var hungerSecondsPerBlock = .15;
var marked = [];
var debug = false;

serverSystem.initialize = function () {
    this.listenForEvent("minecraft:player_destroyed_block", (eventData) => this.onBlockBroken(eventData))

    this.registerEventData("floodminer:blockbroken", {player: null, block_position: null, block_identifier: null, item: null})
};

serverSystem.update = function(){
    if(marked.length > 0){
        let pos = marked.shift()
        let commandData = this.createEventData("minecraft:execute_command")
        //Definitely won't work in multiplayer now with this @p
        commandData.data.command = "/execute @p ~ ~ ~ setblock " + pos.x + " " + pos.y + " " + pos.z + " air 0 destroy"
        this.broadcastEvent("minecraft:execute_command", commandData)
    }
}

serverSystem.onBlockBroken = function(eventData){
    if(debug){
        let chatEventData = this.createEventData("minecraft:display_chat_event")
        chatEventData.data.message = "Player broke: " + eventData.data.block_identifier
        this.broadcastEvent("minecraft:display_chat_event", chatEventData)
    }

    //Get the tool/item used to mine the block
    let handContainer = serverSystem.getComponent(eventData.data.player, "minecraft:hand_container");
    let mainItem = handContainer.data[0];

    // Get the players hotbar
    let playerHotbar = serverSystem.getComponent(eventData.data.player, "minecraft:hotbar_container");
    
    // Only trigger a flood mine if the player has an active flood gem in their hotbar
    let triggerFloodminer = false;
    playerHotbar.data.forEach(slot => {
        if(slot.item == "floodminer:active_flood_gem"){
            triggerFloodminer = true;
        }
    })

    if(debug && triggerFloodminer){
        let chatEventData = this.createEventData("minecraft:display_chat_event")
        chatEventData.data.message = "Floodmine requirements met"
        this.broadcastEvent("minecraft:display_chat_event", chatEventData)
    }

    let requestData = this.createEventData("floodminer:blockbroken")
    requestData.data.player = eventData.data.player
    requestData.data.block_position = eventData.data.block_position
    requestData.data.block_identifier = eventData.data.block_identifier
    requestData.data.item = mainItem
    //this.broadcastEvent("floodminer:blockbroken", requestData)
    if(triggerFloodminer){
        this.floodmine(requestData)
    }
}

serverSystem.floodmine = function(eventData){
    if(debug){
        let chatEventData = this.createEventData("minecraft:display_chat_event")
        chatEventData.data.message = "Flood mine request received! " + eventData.data.block_identifier + " at " + JSON.stringify(eventData.data.block_position)
        this.broadcastEvent("minecraft:display_chat_event", chatEventData)
    }

    let tickWorld = serverSystem.getComponent(eventData.data.player, "minecraft:tick_world")
    let tickingArea = tickWorld.data["ticking_area"]
    marked = [];
    let queue = [];
    let blocks = null;
    queue.push(eventData.data.block_position)
    
    while(marked.length < maxFloodSize && queue.length > 0){
        let current = queue.shift(); 

        blockCube = serverSystem.getBlocks(tickingArea, {x: current.x - 1, y: current.y - 1, z: current.z - 1}, {x: current.x + 1, y: current.y + 1, z: current.z + 1})
        if(blockCube != null){

            blockCube.forEach(function(blockSlice){
                blockSlice.forEach(function(blockLine){
                    blockLine.forEach(function(block){
                        //Stone/andesite/granite etc are all stored as stone, but with extra data I do not know how to access
                        let exception = false
                        if(eventData.data.block_identifier == "minecraft:lit_redstone_ore" && block.__identifier__  == "minecraft:redstone_ore"){
                            exception = true
                        }
                        if(block.__identifier__ == eventData.data.block_identifier || exception){

                            let existsInMarked = marked.some(function(position){
                                return serverSystem.compPos(position, block.block_position)
                            })

                            if(!existsInMarked){
                                let existsInQueue = queue.some(function(position){
                                    return serverSystem.compPos(position, block.block_position)
                                })
                                if(!existsInQueue){
                                    marked.push(block.block_position)
                                    queue.push(block.block_position)
                                }
                            }
                        }
                    })
                })
            })
        }
    } 

    //Apply nausea debuff based on the number of blocks marked
    let hungerTime = Math.floor(hungerSecondsPerBlock * marked.length);
    if(hungerTime > 0){
        let commandData = this.createEventData("minecraft:execute_command")
        commandData.data.command = "/execute @p ~ ~ ~ effect @p hunger " + hungerTime + " 2 true"
        this.broadcastEvent("minecraft:execute_command", commandData)
    }
    
    if(debug){
        let message = "Blocks acquired: "
        marked.forEach(function(item){
            message += JSON.stringify(item) + " "
        })

        chatEventData = this.createEventData("minecraft:display_chat_event")
        chatEventData.data.message = message
        this.broadcastEvent("minecraft:display_chat_event", chatEventData) 
    }
}

serverSystem.compPos = function(p1, p2){
    return p1.x == p2.x && p1.y == p2.y && p1.z == p2.z
}