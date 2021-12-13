RRTE = RegisterMod("Repentance Run Tracker Extended", 1)
local enableDebug = true
local playerNumber = -1

Isaac.DebugString("[RRTEEXTENDLOGS] Repentance Run Tracker Extended loaded")

function table.val_to_str(v)
    if "string" == type(v) then
        v = string.gsub(v, "\n", "\\n")
        if string.match(string.gsub(v, "[^'\"]", ""), '^"+$') then
            return "'" .. v .. "'"
        end
        return '"' .. string.gsub(v, '"', '\\"') .. '"'
    else
        return "table" == type(v) and table.tostring(v) or tostring(v)
    end
end

function table.key_to_str(k)
    if "string" == type(k) and string.match(k, "^[_%a][_%a%d]*$") then
        return k
    else
        return "[" .. table.val_to_str(k) .. "]"
    end
end

function table.tostring(tbl)
    local result, done = {}, {}
    for k, v in ipairs(tbl) do
        table.insert(result, table.val_to_str(v))
        done[k] = true
    end
    for k, v in pairs(tbl) do
        if not done[k] then
            table.insert(result, table.key_to_str(k) .. "=" .. table.val_to_str(v))
        end
    end
    return "{" .. table.concat(result, ",") .. "}"
end

function RRTE:playerInit(Player)
    playerNumber = playerNumber + 1
    Player:GetData()["infos"] = {
        ["index"] = Player.Index,
        ["variant"] = Player.Variant,
        ["subtype"] = Player.SubType,
        ["number"] = playerNumber
    }
    Player:GetData()["stats"] = {
        ["moveSpeed"] = math.ceil((Player.MoveSpeed) * 10^2) / 10^2,
        ["luck"] = math.ceil((Player.Luck) * 10^2) / 10^2,
        ["damage"] = math.ceil((Player.Damage) * 10^2) / 10^2,
        ["maxFireDelay"] = math.ceil((Player.MaxFireDelay) * 10^2) / 10^2,
        -- ["fireDelay"] = Player.FireDelay,
        ["currentFireDelay"] = math.ceil((30/(Player.MaxFireDelay + 1)) * 10^2) / 10^2,
        ["shotSpeed"] =  math.ceil((Player.ShotSpeed) * 10^2) / 10^2,
        ["tearFallingAcceleration"] = math.ceil((Player.TearFallingAcceleration) * 10^2) / 10^2,
        ["tearFallingSpeed"] = math.ceil((Player.TearFallingSpeed) * 10^2) / 10^2,
        ["tearHeight"] = math.ceil((Player.TearHeight) * 10^2) / 10^2,
    }
    Player:GetData()["life"] = {
        ["maxHearts"] = Player:GetMaxHearts(),
        ["brokenHearts"] = Player:GetBrokenHearts(),
        ["hearts"] = Player:GetHearts(),
        ["rottenHearts"] = Player:GetRottenHearts(),
        ["boneHearts"] = Player:GetBoneHearts(),
        ["soulHearts"] = Player:GetSoulHearts(),
        ["blackHearts"] = Player:GetBlackHearts(),
        ["extraLives"] = Player:GetExtraLives()
    }
    Player:GetData()["usables"] = {
        ["coins"] = Player:GetNumCoins(),
        ["bombs"] = Player:GetNumBombs(),
        ["keys"] = Player:GetNumKeys()
    }
    Isaac.DebugString("[RRTEEXTENDLOGS] Player init : " .. table.tostring(Player:GetData()))
end

function RRTE:playerUpdate(Player)
    -- Update player stats infos
    if Player:GetData()["stats"]["moveSpeed"] ~= math.ceil((Player.MoveSpeed) * 10^2) / 10^2 or
    Player:GetData()["stats"]["luck"] ~= math.ceil((Player.Luck) * 10^2) / 10^2 or
    Player:GetData()["stats"]["damage"] ~= math.ceil((Player.Damage) * 10^2) / 10^2 or
    Player:GetData()["stats"]["maxFireDelay"] ~= math.ceil((Player.MaxFireDelay) * 10^2) / 10^2 or
    -- Player:GetData()["stats"]["fireDelay"] ~= Player.FireDelay or
    Player:GetData()["stats"]["shotSpeed"] ~= math.ceil((Player.ShotSpeed) * 10^2) / 10^2 or
    Player:GetData()["stats"]["tearFallingAcceleration"] ~= math.ceil((Player.TearFallingAcceleration) * 10^2) / 10^2 or
    Player:GetData()["stats"]["tearFallingSpeed"] ~= math.ceil((Player.TearFallingSpeed) * 10^2) / 10^2 or
    Player:GetData()["stats"]["tearHeight"] ~= math.ceil((Player.TearHeight) * 10^2) / 10^2 then
        Player:GetData()["stats"] = {
            ["moveSpeed"] = math.ceil((Player.MoveSpeed) * 10^2) / 10^2,
            ["luck"] = math.ceil((Player.Luck) * 10^2) / 10^2,
            ["damage"] = math.ceil((Player.Damage) * 10^2) / 10^2,
            ["maxFireDelay"] = math.ceil((Player.MaxFireDelay) * 10^2) / 10^2,
            -- ["fireDelay"] = Player.FireDelay,
            ["currentFireDelay"] = math.ceil((30/(Player.MaxFireDelay + 1)) * 10^2) / 10^2,
            ["shotSpeed"] = math.ceil((Player.ShotSpeed) * 10^2) / 10^2,
            ["tearFallingAcceleration"] = math.ceil((Player.TearFallingAcceleration) * 10^2) / 10^2,
            ["tearFallingSpeed"] = math.ceil((Player.TearFallingSpeed) * 10^2) / 10^2,
            ["tearHeight"] = math.ceil((Player.TearHeight) * 10^2) / 10^2
        }
        Isaac.DebugString("[RRTEEXTENDLOGS] Player updated [stats] : " .. table.tostring(Player:GetData()))
    end

    -- Update player life infos
    if Player:GetData()["life"]["maxHearts"] ~= Player:GetMaxHearts() or
    Player:GetData()["life"]["brokenHearts"] ~= Player:GetBrokenHearts() or
    Player:GetData()["life"]["hearts"] ~= Player:GetHearts() or
    Player:GetData()["life"]["rottenHearts"] ~= Player:GetRottenHearts() or
    Player:GetData()["life"]["boneHearts"] ~= Player:GetBoneHearts() or
    Player:GetData()["life"]["soulHearts"] ~= Player:GetSoulHearts() or
    Player:GetData()["life"]["blackHearts"] ~= Player:GetBlackHearts() or
    Player:GetData()["life"]["extraLives"] ~= Player:GetExtraLives() then
        Player:GetData()["life"] = {
            ["maxHearts"] = Player:GetMaxHearts(),
            ["brokenHearts"] = Player:GetBrokenHearts(),
            ["hearts"] = Player:GetHearts(),
            ["rottenHearts"] = Player:GetRottenHearts(),
            ["boneHearts"] = Player:GetBoneHearts(),
            ["soulHearts"] = Player:GetSoulHearts(),
            ["blackHearts"] = Player:GetBlackHearts(),
            ["extraLives"] = Player:GetExtraLives()
        }
        Isaac.DebugString("[RRTEEXTENDLOGS] Player updated [life] : " .. table.tostring(Player:GetData()))
    end

    -- Update player usables infos
    if Player:GetData()["usables"]["coins"] ~= Player:GetNumCoins() or
    Player:GetData()["usables"]["bombs"] ~= Player:GetNumBombs() or
    Player:GetData()["usables"]["keys"] ~= Player:GetNumKeys() then
        Player:GetData()["usables"] = {
            ["coins"] = Player:GetNumCoins(),
            ["bombs"] = Player:GetNumBombs(),
            ["keys"] = Player:GetNumKeys()
        }
        Isaac.DebugString("[RRTEEXTENDLOGS] Player updated [usable] : " .. table.tostring(Player:GetData()))
    end
end

function RRTE:entityRemoved(entity)
    if entity.Type == EntityType.ENTITY_PLAYER then
        if playerNumber > -1 then playerNumber = playerNumber - 1 end
    end
end

function RRTE:newRoom()
    local room = Game():GetRoom()
    local roomType = room:GetType()
    if roomType == RoomType.ROOM_TREASURE then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : treasure") end
    if roomType == RoomType.ROOM_SHOP then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : shop") end
    if roomType == RoomType.ROOM_ERROR then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : error") end
    if roomType == RoomType.ROOM_BOSS then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : boss") end
    if roomType == RoomType.ROOM_MINIBOSS then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : miniboss") end
    if roomType == RoomType.ROOM_SECRET then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : secret") end
    if roomType == RoomType.ROOM_SUPERSECRET then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : super secret") end
    if roomType == RoomType.ROOM_ARCADE then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : arcade") end
    if roomType == RoomType.ROOM_CURSE then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : curse") end
    if roomType == RoomType.ROOM_CHALLENGE then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : challenge") end
    if roomType == RoomType.ROOM_LIBRARY then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : library") end
    if roomType == RoomType.ROOM_SACRIFICE then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : sacrifice") end
    if roomType == RoomType.ROOM_DEVIL then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : devil") end
    if roomType == RoomType.ROOM_ANGEL then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : angel") end
    if roomType == RoomType.ROOM_DUNGEON then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : dungeon") end
    if roomType == RoomType.ROOM_BOSSRUSH then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : bossrush") end
    if roomType == RoomType.ROOM_ISAACS then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : isaacs") end
    if roomType == RoomType.ROOM_BARREN then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : barren") end
    if roomType == RoomType.ROOM_CHEST then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : chest") end
    if roomType == RoomType.ROOM_DICE then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : dice") end
    if roomType == RoomType.ROOM_BLACK_MARKET then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : black market") end
    if roomType == RoomType.ROOM_PLANETARIUM then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : planetarium") end
    if roomType == RoomType.ROOM_ULTRASECRET then Isaac.DebugString("[RRTEEXTENDLOGS] Room [type] : ultra secret") end
end

function RRTE:runStart()
    Isaac.DebugString("[RRTEEXTENDLOGS] Run Start [seed] : " .. Game():GetSeeds():GetStartSeedString())
end

function RRTE:runEnd()
    playerNumber = -1
    Isaac.DebugString("[RRTEEXTENDLOGS] Run End [time] : " .. (Game().TimeCounter) / 30)
end

function RRTE:runExit()
    playerNumber = -1
end

RRTE:AddCallback(ModCallbacks.MC_POST_PEFFECT_UPDATE, RRTE.playerUpdate)
RRTE:AddCallback(ModCallbacks.MC_POST_PLAYER_INIT, RRTE.playerInit)
RRTE:AddCallback(ModCallbacks.MC_POST_ENTITY_REMOVE, RRTE.entityRemoved)
RRTE:AddCallback(ModCallbacks.MC_POST_NEW_ROOM, RRTE.newRoom)
RRTE:AddCallback(ModCallbacks.MC_POST_GAME_STARTED, RRTE.runStart)
RRTE:AddCallback(ModCallbacks.MC_POST_GAME_END, RRTE.runEnd)
RRTE:AddCallback(ModCallbacks.MC_PRE_GAME_EXIT, RRTE.runExit)