export const getRunLastBosses = (floors) => {
    const forcedIds = ["45.0.0", "78.0.0", "78.1.0", "407.0.0"]
    const lastBosses = []
    floors.forEach(floor => {
        const lastBossesFromFloor = floor.entities?.filter(entity => entity.lastBoss === true || forcedIds.includes(entity.id))
        if (lastBossesFromFloor?.length > 0) lastBosses.push(...lastBossesFromFloor)
    });
    console.log(lastBosses)
    return lastBosses.reverse()
}