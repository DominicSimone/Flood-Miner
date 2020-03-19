/*
Important notes: This is made for Bedrock 1.15 beta
World creation: Experimental features ON, cheats ON, include the Flood Miner behavior pack

Sneak before you start mining a block, and unsneak before destroying a block to trigger flood mining.
*/

var serverSystem = server.registerSystem(0, 0);

var maxFloodSize = 32 - 1;
var marked = [];
var debug = false;

serverSystem.initialize = function () {
    this.listenForEvent("minecraft:player_destroyed_block", (eventData) => this.onBlockBroken(eventData))
    this.listenForEvent("minecraft:block_destruction_started", (eventData) => this.onBlockBreaking(eventData))
    this.listenForEvent("minecraft:block_destruction_stopped", (eventData) => this.onStoppedMining(eventData))

    this.listenForEvent("floodminer:floodmine", (eventData) => this.floodmine(eventData))

    this.registerEventData("floodminer:blockbreaking", {player: null, block_position: null})
    this.registerEventData("floodminer:blockbroken", {player: null, block_position: null, block_identifier: null, item: null})
    this.registerEventData("floodminer:stoppedmining", {})
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

serverSystem.onBlockBreaking = function(eventData){
    if(debug){
        let chatEventData = this.createEventData("minecraft:display_chat_event")
        chatEventData.data.message = "Player breaking!"
        this.broadcastEvent("minecraft:display_chat_event", chatEventData)
    }

    let requestData = this.createEventData("floodminer:blockbreaking")
    requestData.data.player = eventData.data.player
    requestData.data.block_position = eventData.data.block_position
    this.broadcastEvent("floodminer:blockbreaking", requestData)
}

serverSystem.onBlockBroken = function(eventData){
    if(debug){
        let chatEventData = this.createEventData("minecraft:display_chat_event")
        chatEventData.data.message = "Player broke " + eventData.data.block_identifier
        this.broadcastEvent("minecraft:display_chat_event", chatEventData)
    }

    //Get the tool/item used to mine the block
    let handContainer = serverSystem.getComponent(eventData.data.player, "minecraft:hand_container");
    let mainItem = handContainer.data[0];
    
    if(debug){
        let itemData = this.createEventData("minecraft:display_chat_event")
        itemData.data.message = "Player has " + JSON.stringify(mainItem)
        this.broadcastEvent("minecraft:display_chat_event", itemData)
    }

    let requestData = this.createEventData("floodminer:blockbroken")
    requestData.data.player = eventData.data.player
    requestData.data.block_position = eventData.data.block_position
    requestData.data.block_identifier = eventData.data.block_identifier
    requestData.data.item = mainItem
    this.broadcastEvent("floodminer:blockbroken", requestData)
}

serverSystem.onStoppedMining = function(eventData){
    let requestData = this.createEventData("floodminer:stoppedmining")
    this.broadcastEvent("floodminer:stoppedmining", requestData)
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
                        //Need to make exceptions here for lit_redstone_ore and redstone_ore
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
