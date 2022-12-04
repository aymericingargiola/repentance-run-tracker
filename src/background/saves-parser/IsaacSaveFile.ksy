# Kaitai Struct
# https://kaitai.io/

# This is a struct definition file for save files for The Binding of Isaac: Repentance.

meta:
  id: isaac_save_file
  endian: le

seq:
  - id: header
    type: save_header
  - id: chunks
    type: chunk
    repeat: expr
    repeat-expr: 11

types:
  save_header:
    seq:
      - id: magic
        contents: 'ISAACNGSAVE09R  '
      - id: crc
        type: s4
  chunk:
    seq:
      - id: type
        type: s4
        enum: chunk_type
      - id: len
        type: s4
        doc: This tends to be wrong
      - id: body
        type:
          switch-on: type
          cases:
            'chunk_type::achievements': achievements_chunk
            'chunk_type::counters': counters_chunk
            'chunk_type::level_counters': level_counters_chunk
            'chunk_type::collectibles': collectibles_chunk
            'chunk_type::minibosses': minibosses_chunk
            'chunk_type::bosses': bosses_chunk
            'chunk_type::challenge_counters': challenge_counters_chunk
            'chunk_type::cutscene_counters': cutscene_counters_chunk
            'chunk_type::game_settings': game_settings_chunk
            'chunk_type::special_seed_counters': special_seed_counters_chunk
            'chunk_type::bestiary_counters': bestiary_counters_chunk

  achievements_chunk:
    seq:
      - id: count
        type: s4
      - id: achievements
        type: u1
        repeat: expr
        repeat-expr: count

  counters_chunk:
    seq:
      - id: count
        type: s4
      - id: counters
        type: s4
        repeat: expr
        repeat-expr: count

  level_counters_chunk:
    seq:
      - id: count
        type: s4
      - id: counters
        type: s4
        repeat: expr
        repeat-expr: count

  collectibles_chunk:
    seq:
      - id: count
        type: s4
      - id: seen_by_id
        type: u1
        repeat: expr
        repeat-expr: count

  minibosses_chunk:
    seq:
      - id: count
        type: s4
      - id: seen_by_id
        type: u1
        repeat: expr
        repeat-expr: count

  bosses_chunk:
    seq:
      - id: count
        type: s4
      - id: seen_by_id
        type: u1
        repeat: expr
        repeat-expr: count

  challenge_counters_chunk:
    seq:
      - id: count
        type: s4
      - id: completed_by_id
        type: u1
        repeat: expr
        repeat-expr: count

  cutscene_counters_chunk:
    seq:
      - id: count
        type: s4
      - id: count_by_id
        type: s4
        repeat: expr
        repeat-expr: count

  game_settings_chunk:
    seq:
      - id: count
        type: s4
      - id: unk
        type: s4
        repeat: expr
        repeat-expr: count

  special_seed_counters_chunk:
    seq:
      - id: count
        type: s4
      - id: count_by_id
        type: u1
        repeat: expr
        repeat-expr: count

  bestiary_counters_chunk:
    seq:
      - id: count
        type: u4
      - id: counters
        type: bestiary_counter
        repeat: expr
        repeat-expr: count

  bestiary_counter:
    seq:
      - id: type
        type: s4
        enum: bestiary_type
      - id: count
        type: s4
      - id: body
        type:
          switch-on: type
          cases:
            'bestiary_type::hits': bestiary_hits
            'bestiary_type::deaths': bestiary_deaths
            'bestiary_type::kills': bestiary_kills
            'bestiary_type::encounters': bestiary_encounters

  bestiary_hits:
    seq:
      - id: values
        type: entity_value
        repeat: expr
        repeat-expr: _parent.count / 4

  bestiary_deaths:
    seq:
      - id: values
        type: entity_value
        repeat: expr
        repeat-expr: _parent.count / 4

  bestiary_kills:
    seq:
      - id: values
        type: entity_value
        repeat: expr
        repeat-expr: _parent.count / 4

  bestiary_encounters:
    seq:
      - id: values
        type: entity_value
        repeat: expr
        repeat-expr: _parent.count / 4

  entity_value:
    seq:
      - id: entity
        type: s4
      - id: value
        type: s4

enums:
  chunk_type:
    1: achievements
    2: counters
    3: level_counters
    4: collectibles
    5: minibosses
    6: bosses
    7: challenge_counters
    8: cutscene_counters
    9: game_settings
    10: special_seed_counters
    11: bestiary_counters
  bestiary_type:
    1: encounters
    2: kills
    3: hits
    4: deaths