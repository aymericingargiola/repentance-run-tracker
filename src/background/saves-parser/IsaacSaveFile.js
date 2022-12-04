const KaitaiStream = require('kaitai-struct/KaitaiStream')
module.exports = {
    IsaacSaveFile: (() => {
        IsaacSaveFile.ChunkType = Object.freeze({
          ACHIEVEMENTS: 1,
          COUNTERS: 2,
          LEVEL_COUNTERS: 3,
          COLLECTIBLES: 4,
          MINIBOSSES: 5,
          BOSSES: 6,
          CHALLENGE_COUNTERS: 7,
          CUTSCENE_COUNTERS: 8,
          GAME_SETTINGS: 9,
          SPECIAL_SEED_COUNTERS: 10,
          BESTIARY_COUNTERS: 11,
      
          1: "ACHIEVEMENTS",
          2: "COUNTERS",
          3: "LEVEL_COUNTERS",
          4: "COLLECTIBLES",
          5: "MINIBOSSES",
          6: "BOSSES",
          7: "CHALLENGE_COUNTERS",
          8: "CUTSCENE_COUNTERS",
          9: "GAME_SETTINGS",
          10: "SPECIAL_SEED_COUNTERS",
          11: "BESTIARY_COUNTERS",
        });
      
        IsaacSaveFile.BestiaryType = Object.freeze({
          ENCOUNTERS: 1,
          KILLS: 2,
          HITS: 3,
          DEATHS: 4,
      
          1: "ENCOUNTERS",
          2: "KILLS",
          3: "HITS",
          4: "DEATHS",
        });
      
        function IsaacSaveFile(_io, _parent, _root) {
          this._io = _io;
          this._parent = _parent;
          this._root = _root || this;
          this.saveNumber = null;
      
          this._read();
        }
        IsaacSaveFile.prototype._read = function() {
          this.header = new SaveHeader(this._io, this, this._root);
          this.chunks = new Array(11);
          for (var i = 0; i < 11; i++) {
            this.chunks[i] = new Chunk(this._io, this, this._root);
          }
        }
      
        var CountersChunk = IsaacSaveFile.CountersChunk = (function() {
          function CountersChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          CountersChunk.prototype._read = function() {
            this.count = this._io.readS4le();
            this.counters = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.counters[i] = this._io.readS4le();
            }
          }
      
          return CountersChunk;
        })();
      
        var BestiaryCounter = IsaacSaveFile.BestiaryCounter = (function() {
          function BestiaryCounter(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          BestiaryCounter.prototype._read = function() {
            this.type = this._io.readS4le();
            this.count = this._io.readS4le();
            switch (this.type) {
            case IsaacSaveFile.BestiaryType.HITS:
              this.body = new BestiaryHits(this._io, this, this._root);
              break;
            case IsaacSaveFile.BestiaryType.DEATHS:
              this.body = new BestiaryDeaths(this._io, this, this._root);
              break;
            case IsaacSaveFile.BestiaryType.KILLS:
              this.body = new BestiaryKills(this._io, this, this._root);
              break;
            case IsaacSaveFile.BestiaryType.ENCOUNTERS:
              this.body = new BestiaryEncounters(this._io, this, this._root);
              break;
            }
          }
      
          return BestiaryCounter;
        })();
      
        var Chunk = IsaacSaveFile.Chunk = (function() {
          function Chunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          Chunk.prototype._read = function() {
            this.type = this._io.readS4le();
            this.len = this._io.readS4le();
            switch (this.type) {
            case IsaacSaveFile.ChunkType.MINIBOSSES:
              this.body = new MinibossesChunk(this._io, this, this._root);
              break;
            case IsaacSaveFile.ChunkType.CHALLENGE_COUNTERS:
              this.body = new ChallengeCountersChunk(this._io, this, this._root);
              break;
            case IsaacSaveFile.ChunkType.CUTSCENE_COUNTERS:
              this.body = new CutsceneCountersChunk(this._io, this, this._root);
              break;
            case IsaacSaveFile.ChunkType.SPECIAL_SEED_COUNTERS:
              this.body = new SpecialSeedCountersChunk(this._io, this, this._root);
              break;
            case IsaacSaveFile.ChunkType.LEVEL_COUNTERS:
              this.body = new LevelCountersChunk(this._io, this, this._root);
              break;
            case IsaacSaveFile.ChunkType.BESTIARY_COUNTERS:
              this.body = new BestiaryCountersChunk(this._io, this, this._root);
              break;
            case IsaacSaveFile.ChunkType.ACHIEVEMENTS:
              this.body = new AchievementsChunk(this._io, this, this._root);
              break;
            case IsaacSaveFile.ChunkType.GAME_SETTINGS:
              this.body = new GameSettingsChunk(this._io, this, this._root);
              break;
            case IsaacSaveFile.ChunkType.COUNTERS:
              this.body = new CountersChunk(this._io, this, this._root);
              break;
            case IsaacSaveFile.ChunkType.COLLECTIBLES:
              this.body = new CollectiblesChunk(this._io, this, this._root);
              break;
            case IsaacSaveFile.ChunkType.BOSSES:
              this.body = new BossesChunk(this._io, this, this._root);
              break;
            }
          }
      
          /**
           * This tends to be wrong
           */
      
          return Chunk;
        })();
      
        var EntityValue = IsaacSaveFile.EntityValue = (function() {
          function EntityValue(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          EntityValue.prototype._read = function() {
            this.entity = this._io.readS4le();
            this.value = this._io.readS4le();
          }
      
          return EntityValue;
        })();
      
        var BestiaryDeaths = IsaacSaveFile.BestiaryDeaths = (function() {
          function BestiaryDeaths(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          BestiaryDeaths.prototype._read = function() {
            this.values = new Array(Math.floor(this._parent.count / 4));
            for (var i = 0; i < Math.floor(this._parent.count / 4); i++) {
              this.values[i] = new EntityValue(this._io, this, this._root);
            }
          }
      
          return BestiaryDeaths;
        })();
      
        var AchievementsChunk = IsaacSaveFile.AchievementsChunk = (function() {
          function AchievementsChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          AchievementsChunk.prototype._read = function() {
            this.count = this._io.readS4le();
            this.achievements = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.achievements[i] = this._io.readU1();
            }
          }
      
          return AchievementsChunk;
        })();
      
        var CollectiblesChunk = IsaacSaveFile.CollectiblesChunk = (function() {
          function CollectiblesChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          CollectiblesChunk.prototype._read = function() {
            this.count = this._io.readS4le();
            this.seenById = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.seenById[i] = this._io.readU1();
            }
          }
      
          return CollectiblesChunk;
        })();
      
        var LevelCountersChunk = IsaacSaveFile.LevelCountersChunk = (function() {
          function LevelCountersChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          LevelCountersChunk.prototype._read = function() {
            this.count = this._io.readS4le();
            this.counters = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.counters[i] = this._io.readS4le();
            }
          }
      
          return LevelCountersChunk;
        })();
      
        var SaveHeader = IsaacSaveFile.SaveHeader = (function() {
          function SaveHeader(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          SaveHeader.prototype._read = function() {
            this.magic = this._io.readBytes(16);
            if (!((KaitaiStream.byteArrayCompare(this.magic, [73, 83, 65, 65, 67, 78, 71, 83, 65, 86, 69, 48, 57, 82, 32, 32]) == 0))) {
              throw new KaitaiStream.ValidationNotEqualError([73, 83, 65, 65, 67, 78, 71, 83, 65, 86, 69, 48, 57, 82, 32, 32], this.magic, this._io, "/types/save_header/seq/0");
            }
            this.crc = this._io.readS4le();
          }
      
          return SaveHeader;
        })();
      
        var CutsceneCountersChunk = IsaacSaveFile.CutsceneCountersChunk = (function() {
          function CutsceneCountersChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          CutsceneCountersChunk.prototype._read = function() {
            this.count = this._io.readS4le();
            this.countById = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.countById[i] = this._io.readS4le();
            }
          }
      
          return CutsceneCountersChunk;
        })();
      
        var ChallengeCountersChunk = IsaacSaveFile.ChallengeCountersChunk = (function() {
          function ChallengeCountersChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          ChallengeCountersChunk.prototype._read = function() {
            this.count = this._io.readS4le();
            this.completedById = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.completedById[i] = this._io.readU1();
            }
          }
      
          return ChallengeCountersChunk;
        })();
      
        var BestiaryCountersChunk = IsaacSaveFile.BestiaryCountersChunk = (function() {
          function BestiaryCountersChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          BestiaryCountersChunk.prototype._read = function() {
            this.count = this._io.readU4le();
            this.counters = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.counters[i] = new BestiaryCounter(this._io, this, this._root);
            }
          }
      
          return BestiaryCountersChunk;
        })();
      
        var MinibossesChunk = IsaacSaveFile.MinibossesChunk = (function() {
          function MinibossesChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          MinibossesChunk.prototype._read = function() {
            this.count = this._io.readS4le();
            this.seenById = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.seenById[i] = this._io.readU1();
            }
          }
      
          return MinibossesChunk;
        })();
      
        var SpecialSeedCountersChunk = IsaacSaveFile.SpecialSeedCountersChunk = (function() {
          function SpecialSeedCountersChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          SpecialSeedCountersChunk.prototype._read = function() {
            this.count = this._io.readS4le();
            this.countById = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.countById[i] = this._io.readU1();
            }
          }
      
          return SpecialSeedCountersChunk;
        })();
      
        var BestiaryEncounters = IsaacSaveFile.BestiaryEncounters = (function() {
          function BestiaryEncounters(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          BestiaryEncounters.prototype._read = function() {
            this.values = new Array(Math.floor(this._parent.count / 4));
            for (var i = 0; i < Math.floor(this._parent.count / 4); i++) {
              this.values[i] = new EntityValue(this._io, this, this._root);
            }
          }
      
          return BestiaryEncounters;
        })();
      
        var BestiaryKills = IsaacSaveFile.BestiaryKills = (function() {
          function BestiaryKills(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          BestiaryKills.prototype._read = function() {
            this.values = new Array(Math.floor(this._parent.count / 4));
            for (var i = 0; i < Math.floor(this._parent.count / 4); i++) {
              this.values[i] = new EntityValue(this._io, this, this._root);
            }
          }
      
          return BestiaryKills;
        })();
      
        var BestiaryHits = IsaacSaveFile.BestiaryHits = (function() {
          function BestiaryHits(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          BestiaryHits.prototype._read = function() {
            this.values = new Array(Math.floor(this._parent.count / 4));
            for (var i = 0; i < Math.floor(this._parent.count / 4); i++) {
              this.values[i] = new EntityValue(this._io, this, this._root);
            }
          }
      
          return BestiaryHits;
        })();
      
        var GameSettingsChunk = IsaacSaveFile.GameSettingsChunk = (function() {
          function GameSettingsChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          GameSettingsChunk.prototype._read = function() {
            this.count = this._io.readS4le();
            this.unk = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.unk[i] = this._io.readS4le();
            }
          }
      
          return GameSettingsChunk;
        })();
      
        var BossesChunk = IsaacSaveFile.BossesChunk = (function() {
          function BossesChunk(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
      
            this._read();
          }
          BossesChunk.prototype._read = function() {
            this.count = this._io.readS4le();
            this.seenById = new Array(this.count);
            for (var i = 0; i < this.count; i++) {
              this.seenById[i] = this._io.readU1();
            }
          }
      
          return BossesChunk;
        })();
      
        return IsaacSaveFile;
    })()
}