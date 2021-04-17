RRTE = RegisterMod("Repentance Run Tracker Extended", 1)
RRTE.GameVersion = "rep"
local enableDebug = true

Isaac.DebugString("[RRTE EXTEND LOGS] Repentance Run Tracker Extended loaded")

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
    Player:GetData()["infos"] = {
        ["index"] = Player.Index,
        ["variant"] = Player.Variant,
        ["subtype"] = Player.SubType
    }
    Player:GetData()["stats"] = {
        ["moveSpeed"] = Player.MoveSpeed,
        ["luck"] = Player.Luck,
        ["damage"] = Player.Damage,
        ["maxFireDelay"] = Player.MaxFireDelay,
        ["fireDelay"] = Player.FireDelay,
        ["shotSpeed"] = Player.ShotSpeed,
        ["tearFallingAcceleration"] = Player.TearFallingAcceleration,
        ["tearFallingSpeed"] = Player.TearFallingSpeed,
        ["tearHeight"] = Player.TearHeight
    }
    Player:GetData()["life"] = {
        ["hearts"] = Player:GetHearts(),
        ["soulHearts"] = Player:GetSoulHearts(),
        ["blackHearts"] = Player:GetBlackHearts()
    }
    Player:GetData()["usables"] = {
        ["coins"] = Player:GetNumCoins(),
        ["bombs"] = Player:GetNumBombs(),
        ["keys"] = Player:GetNumKeys()
    }
    Isaac.DebugString("[RRTE EXTEND LOGS] Player init :" .. table.tostring(Player:GetData()))
end

function RRTE:playerUpdate(Player)
    -- Update player stats infos
    if Player:GetData()["stats"]["moveSpeed"] ~= Player.MoveSpeed or
    Player:GetData()["stats"]["luck"] ~= Player.Luck or
    Player:GetData()["stats"]["damage"] ~= Player.Damage or
    Player:GetData()["stats"]["maxFireDelay"] ~= Player.MaxFireDelay or
    Player:GetData()["stats"]["fireDelay"] ~= Player.FireDelay or
    Player:GetData()["stats"]["shotSpeed"] ~= Player.ShotSpeed or
    Player:GetData()["stats"]["tearFallingAcceleration"] ~= Player.TearFallingAcceleration or
    Player:GetData()["stats"]["tearFallingSpeed"] ~= Player.TearFallingSpeed or
    Player:GetData()["stats"]["tearHeight"] ~= Player.TearHeight then
        Player:GetData()["stats"] = {
            ["moveSpeed"] = Player.MoveSpeed,
            ["luck"] = Player.Luck,
            ["damage"] = Player.Damage,
            ["maxFireDelay"] = Player.MaxFireDelay,
            ["fireDelay"] = Player.FireDelay,
            ["shotSpeed"] = Player.ShotSpeed,
            ["tearFallingAcceleration"] = Player.TearFallingAcceleration,
            ["tearFallingSpeed"] = Player.TearFallingSpeed,
            ["tearHeight"] = Player.TearHeight
        }
        Isaac.DebugString("[RRTE EXTEND LOGS] Player updated [stats] :" .. table.tostring(Player:GetData()))
    end

    -- Update player life infos
    if Player:GetData()["life"]["hearts"] ~= Player:GetHearts() or
    Player:GetData()["life"]["soulHearts"] ~= Player:GetSoulHearts() or
    Player:GetData()["life"]["blackHearts"] ~= Player:GetBlackHearts() then
        Player:GetData()["life"] = {
            ["hearts"] = Player:GetHearts(),
            ["soulHearts"] = Player:GetSoulHearts(),
            ["blackHearts"] = Player:GetBlackHearts()
        }
        Isaac.DebugString("[RRTE EXTEND LOGS] Player updated [life] :" .. table.tostring(Player:GetData()))
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
        Isaac.DebugString("[RRTE EXTEND LOGS] Player updated [usable] :" .. table.tostring(Player:GetData()))
    end
end

RRTE:AddCallback(ModCallbacks.MC_POST_PEFFECT_UPDATE, RRTE.playerUpdate)
RRTE:AddCallback(ModCallbacks.MC_POST_PLAYER_INIT, RRTE.playerInit)

-- function RRTE:entityTakeDamage(TookDamage, DamageAmount, DamageFlag, DamageSource, DamageCountdownFrames)
--     Isaac.DebugString("[RRTE EXTEND LOGS] Damage : "..DamageAmount)
-- end

-- function RRTE:playerCollision(pickUp)
--     Isaac.DebugString("[RRTE EXTEND LOGS] Coins : "..Isaac.GetPlayer(0):GetNumCoins())
-- end

-- function RRTE:usePill(PillEffect)
--     Isaac.DebugString("[RRTE EXTEND LOGS] Pill :"..PillEffect)
-- end

-- function RRTE:useCard(Card)
--     Isaac.DebugString("[RRTE EXTEND LOGS] Card :"..Card)
-- end

-- function RRTE:getCard(rng, CurrentCard, Playing, Runes, OnlyRunes)
--     Isaac.DebugString("[RRTE EXTEND LOGS] Card :"..CurrentCard)
--     Isaac.DebugString("[RRTE EXTEND LOGS] Card :"..Playing)
-- end

-- function RRTE:getTrinket(SelectedTrinket, TrinketRNG)
--     Isaac.DebugString("[RRTE EXTEND LOGS] Card :"..SelectedTrinket)
-- end

-- RRTE:AddCallback(ModCallbacks.MC_ENTITY_TAKE_DMG, RRTE.entityTakeDamage)
-- RRTE:AddCallback(ModCallbacks.MC_PRE_PICKUP_COLLISION, RRTE.playerCollision)
-- RRTE:AddCallback(ModCallbacks.MC_USE_PILL, RRTE.usePill)
-- RRTE:AddCallback(ModCallbacks.MC_USE_CARD, RRTE.useCard)
-- RRTE:AddCallback(ModCallbacks.MC_GET_CARD, RRTE.getCard)
-- RRTE:AddCallback(ModCallbacks.MC_GET_TRINKET, RRTE.getTrinket)