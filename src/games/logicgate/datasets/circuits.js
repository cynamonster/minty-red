/**
 * LogicGate: Silicon Circuit Academy & Puzzles
 * Low-key educational logic gate puzzle dataset designed for normies and puzzle lovers.
 * Teaches AND, OR, NOT, XOR, NAND, and NOR through tactile, real-world circuit scenarios.
 */

export const GATE_INFO = {
  AND: {
    type: 'AND',
    name: 'AND Gate',
    symbol: '&',
    nickname: 'Both Must Be ON',
    tagline: 'ALL inputs required',
    realWorld: 'Two-key missile launch or bank vault: turning one key does nothing. BOTH keys must turn to activate.',
    rule: 'Outputs 1 ONLY when ALL inputs are 1. If any input is 0, it outputs 0.',
    color: '#06b6d4', // cyan
    truthTable: [
      { a: 0, b: 0, out: 0 },
      { a: 0, b: 1, out: 0 },
      { a: 1, b: 0, out: 0 },
      { a: 1, b: 1, out: 1 },
    ],
  },
  OR: {
    type: 'OR',
    name: 'OR Gate',
    symbol: '≥1',
    nickname: 'Any Can Be ON',
    tagline: 'AT LEAST ONE required',
    realWorld: 'Fire alarm: triggers if smoke detector OR heat sensor trips. Either one (or both) sounds the siren.',
    rule: 'Outputs 1 if AT LEAST ONE input is 1. Outputs 0 only if ALL inputs are 0.',
    color: '#10b981', // emerald
    truthTable: [
      { a: 0, b: 0, out: 0 },
      { a: 0, b: 1, out: 1 },
      { a: 1, b: 0, out: 1 },
      { a: 1, b: 1, out: 1 },
    ],
  },
  NOT: {
    type: 'NOT',
    name: 'NOT Inverter',
    symbol: '!',
    nickname: 'Opposite Day',
    tagline: 'Inverts the signal',
    realWorld: 'Refrigerator light: door closed (1) = light off (0). Door opened (0) = light turns on (1).',
    rule: 'Flips the signal: 1 becomes 0, and 0 becomes 1.',
    color: '#f59e0b', // amber
    truthTable: [
      { a: 0, out: 1 },
      { a: 1, out: 0 },
    ],
  },
  XOR: {
    type: 'XOR',
    name: 'XOR Gate',
    symbol: '^',
    nickname: 'Strictly One (Exclusive)',
    tagline: 'ONE or the other, NEVER both',
    realWorld: 'Two-way staircase light switches: toggling either switch changes the light, but both up turns it off.',
    rule: 'Outputs 1 if inputs are DIFFERENT (one is 1, one is 0). If both are 1 or both are 0, outputs 0.',
    color: '#8b5cf6', // purple
    truthTable: [
      { a: 0, b: 0, out: 0 },
      { a: 0, b: 1, out: 1 },
      { a: 1, b: 0, out: 1 },
      { a: 1, b: 1, out: 0 },
    ],
  },
  NAND: {
    type: 'NAND',
    name: 'NAND Gate',
    symbol: '!&',
    nickname: 'Emergency Cutoff',
    tagline: 'Shuts OFF only if BOTH on',
    realWorld: 'Microwave oven safety: door open (1) AND power on (1) = DANGER! Instantly cuts power (0).',
    rule: 'Opposite of AND: outputs 0 ONLY when all inputs are 1. In all other cases, outputs 1.',
    color: '#ec4899', // pink
    truthTable: [
      { a: 0, b: 0, out: 1 },
      { a: 0, b: 1, out: 1 },
      { a: 1, b: 0, out: 1 },
      { a: 1, b: 1, out: 0 },
    ],
  },
  NOR: {
    type: 'NOR',
    name: 'NOR Gate',
    symbol: '!≥',
    nickname: 'Neither Allowed',
    tagline: 'ON only when ALL off',
    realWorld: 'Do Not Disturb mode: No phone calls (0) and no notifications (0) = Peaceful sleep (1).',
    rule: 'Opposite of OR: outputs 1 ONLY when all inputs are 0. If any input is 1, outputs 0.',
    color: '#f43f5e', // rose
    truthTable: [
      { a: 0, b: 0, out: 1 },
      { a: 0, b: 1, out: 0 },
      { a: 1, b: 0, out: 0 },
      { a: 1, b: 1, out: 0 },
    ],
  },
};

/**
 * 22 Handcrafted, educational progressive puzzle circuits.
 * Divided into 4 Chapters:
 * Chapter 1: The Basics (Levels 1-5) - Single gate introduction
 * Chapter 2: Smart Devices (Levels 6-10) - 2-gate combinations
 * Chapter 3: Silicon Logic (Levels 11-16) - Binary math & decision circuits
 * Chapter 4: Cyber Architect (Levels 17-22) - Complex cascades
 */
export const PUZZLES = [
  // ==========================================
  // CHAPTER 1: THE BASICS (Single Gate Focus)
  // ==========================================
  {
    id: 'lvl-01',
    level: 1,
    chapter: 'The Basics',
    title: 'The Dual-Key Vault',
    concept: 'AND Gate • Both Must Be ON',
    lore: 'A high-security vault requires two independent keyholders to turn their keys simultaneously before the heavy door unlocks.',
    hint: 'We need BOTH Key A and Key B to be ON (1). If either key is missing, the door must stay LOCKED (0).',
    targetComponent: 'Vault Solenoid Lock',
    availableGates: ['AND', 'OR'],
    inputs: [
      { id: 'A', label: 'Key A', default: 1 },
      { id: 'B', label: 'Key B', default: 1 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 190, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'AND' },
    testCases: [
      { inputs: { A: 1, B: 1 }, expected: 1, label: 'Both Keys ON' },
      { inputs: { A: 1, B: 0 }, expected: 0, label: 'Only Key A' },
      { inputs: { A: 0, B: 1 }, expected: 0, label: 'Only Key B' },
      { inputs: { A: 0, B: 0 }, expected: 0, label: 'No Keys' },
    ],
  },
  {
    id: 'lvl-02',
    level: 2,
    chapter: 'The Basics',
    title: 'Emergency Fire Siren',
    concept: 'OR Gate • Any Can Be ON',
    lore: 'The building siren must activate if the smoke detector trips OR if the heat sensor detects dangerous temperatures.',
    hint: 'If EITHER sensor (or both) turns ON (1), the siren must sound (1). Only quiet when both are OFF (0).',
    targetComponent: 'Emergency Siren',
    availableGates: ['AND', 'OR'],
    inputs: [
      { id: 'A', label: 'Smoke', default: 1 },
      { id: 'B', label: 'Heat', default: 0 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 190, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'OR' },
    testCases: [
      { inputs: { A: 1, B: 0 }, expected: 1, label: 'Smoke Only' },
      { inputs: { A: 0, B: 1 }, expected: 1, label: 'Heat Only' },
      { inputs: { A: 1, B: 1 }, expected: 1, label: 'Both Sensors' },
      { inputs: { A: 0, B: 0 }, expected: 0, label: 'All Clear' },
    ],
  },
  {
    id: 'lvl-03',
    level: 3,
    chapter: 'The Basics',
    title: 'Automatic Night Lamp',
    concept: 'NOT Inverter • Opposite Day',
    lore: 'A solar-powered streetlamp should turn ON automatically when night falls (sunlight is 0), and turn OFF during the day (sunlight is 1).',
    hint: 'The output must be the exact OPPOSITE of the input. 0 turns into 1, and 1 turns into 0.',
    targetComponent: 'Streetlamp Bulb',
    availableGates: ['NOT', 'AND', 'OR'],
    inputs: [
      { id: 'A', label: 'Sunlight', default: 0 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 190, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'G1', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'NOT' },
    testCases: [
      { inputs: { A: 0 }, expected: 1, label: 'Night (Sun 0 -> Lamp ON)' },
      { inputs: { A: 1 }, expected: 0, label: 'Day (Sun 1 -> Lamp OFF)' },
    ],
  },
  {
    id: 'lvl-04',
    level: 4,
    chapter: 'The Basics',
    title: 'Staircase Light Switches',
    concept: 'XOR Gate • Strictly One (Exclusive)',
    lore: 'A staircase has one switch at the top and one at the bottom. Flipping either switch toggles the light, but having both in the same position turns it off.',
    hint: 'Light is ON when switches are in DIFFERENT positions (one 0, one 1). If both switches are identical (both 1 or both 0), light is OFF.',
    targetComponent: 'Staircase Chandelier',
    availableGates: ['AND', 'OR', 'XOR'],
    inputs: [
      { id: 'A', label: 'Top Sw', default: 1 },
      { id: 'B', label: 'Bot Sw', default: 0 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 190, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'XOR' },
    testCases: [
      { inputs: { A: 1, B: 0 }, expected: 1, label: 'Top ON, Bottom OFF' },
      { inputs: { A: 0, B: 1 }, expected: 1, label: 'Top OFF, Bottom ON' },
      { inputs: { A: 1, B: 1 }, expected: 0, label: 'Both Switches ON' },
      { inputs: { A: 0, B: 0 }, expected: 0, label: 'Both Switches OFF' },
    ],
  },
  {
    id: 'lvl-05',
    level: 5,
    chapter: 'The Basics',
    title: 'Microwave Safety Cutoff',
    concept: 'NAND Gate • Emergency Cutoff',
    lore: 'A microwave allows safe heating (1) under normal conditions. But if the Door is OPEN (1) AND the Microwave is RUNNING (1), it must cut power (0)!',
    hint: 'Outputs 1 in all safe cases. Shuts OFF (0) ONLY if BOTH Door and Magnetron are 1. It is the exact inverse of an AND gate!',
    targetComponent: 'Safe Power Relay',
    availableGates: ['AND', 'OR', 'NAND', 'NOR'],
    inputs: [
      { id: 'A', label: 'Door Open', default: 1 },
      { id: 'B', label: 'Power On', default: 1 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 190, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'NAND' },
    testCases: [
      { inputs: { A: 1, B: 1 }, expected: 0, label: 'Door Open & Running -> CUTOFF!' },
      { inputs: { A: 0, B: 1 }, expected: 1, label: 'Door Closed & Running -> Safe' },
      { inputs: { A: 1, B: 0 }, expected: 1, label: 'Door Open & Off -> Safe' },
      { inputs: { A: 0, B: 0 }, expected: 1, label: 'Idle Standby -> Safe' },
    ],
  },

  // ==========================================
  // CHAPTER 2: SMART DEVICES (2-Gate Cascades)
  // ==========================================
  {
    id: 'lvl-06',
    level: 6,
    chapter: 'Smart Devices',
    title: 'Smart Air Conditioner',
    concept: 'AND + NOT Cascade',
    lore: 'An eco-friendly AC should cool the room if it is HOT (1), but ONLY IF the Window is NOT OPEN (0). If someone opens the window, AC cuts off.',
    hint: 'The window signal passes through a NOT gate first to invert it. What gate should combine the Hot Room signal with the inverted window signal?',
    targetComponent: 'AC Compressor',
    availableGates: ['AND', 'OR', 'XOR'],
    inputs: [
      { id: 'A', label: 'Room Hot', default: 1 },
      { id: 'B', label: 'Window Open', default: 0 },
    ],
    gates: [
      { id: 'G1', type: 'NOT', isSlot: false, x: 145, y: 155 },
      { id: 'G2', type: null, isSlot: true, slotLabel: 'Gate 2', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G2', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 0 },
      { id: 'w3', from: 'G1', to: 'G2', pin: 1 },
      { id: 'w4', from: 'G2', to: 'OUT', pin: 0 },
    ],
    solution: { G2: 'AND' },
    testCases: [
      { inputs: { A: 1, B: 0 }, expected: 1, label: 'Hot & Window Closed -> AC ON' },
      { inputs: { A: 1, B: 1 }, expected: 0, label: 'Hot & Window Open -> AC OFF' },
      { inputs: { A: 0, B: 0 }, expected: 0, label: 'Cool & Window Closed -> AC OFF' },
      { inputs: { A: 0, B: 1 }, expected: 0, label: 'Cool & Window Open -> AC OFF' },
    ],
  },
  {
    id: 'lvl-07',
    level: 7,
    chapter: 'Smart Devices',
    title: 'ATM Biometric Cash Dispenser',
    concept: 'AND + OR Fusion',
    lore: 'An ATM dispenses cash if the ATM Card is inserted, AND the user verifies their identity via either a correct PIN or a Fingerprint scan.',
    hint: 'G1 checks if PIN or Fingerprint is verified. G2 must ensure the Card is inserted AND identity is verified.',
    targetComponent: 'Cash Dispenser Shutter',
    availableGates: ['AND', 'OR', 'XOR'],
    inputs: [
      { id: 'A', label: 'Card In', default: 1 },
      { id: 'B', label: 'PIN OK', default: 0 },
      { id: 'C', label: 'Finger OK', default: 1 },
    ],
    gates: [
      { id: 'G1', type: 'OR', isSlot: false, x: 145, y: 155 },
      { id: 'G2', type: null, isSlot: true, slotLabel: 'Gate 2', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G2', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 0 },
      { id: 'w3', from: 'C', to: 'G1', pin: 1 },
      { id: 'w4', from: 'G1', to: 'G2', pin: 1 },
      { id: 'w5', from: 'G2', to: 'OUT', pin: 0 },
    ],
    solution: { G2: 'AND' },
    testCases: [
      { inputs: { A: 1, B: 1, C: 0 }, expected: 1, label: 'Card In + PIN Valid' },
      { inputs: { A: 1, B: 0, C: 1 }, expected: 1, label: 'Card In + Fingerprint Valid' },
      { inputs: { A: 0, B: 1, C: 1 }, expected: 0, label: 'No Card -> Denied' },
      { inputs: { A: 1, B: 0, C: 0 }, expected: 0, label: 'Card In but No Auth -> Denied' },
    ],
  },
  {
    id: 'lvl-08',
    level: 8,
    chapter: 'Smart Devices',
    title: 'Subway Fare Turnstile',
    concept: 'Dual Gate Design',
    lore: 'The subway gate unlocks if either a valid Transit Card is tapped OR an Emergency Officer key is turned.',
    hint: 'Both inputs are valid ways to pass. What gate outputs 1 if either input is 1?',
    targetComponent: 'Turnstile Ratchet',
    availableGates: ['AND', 'OR', 'XOR', 'NOT'],
    inputs: [
      { id: 'A', label: 'Card Tap', default: 1 },
      { id: 'B', label: 'Officer Key', default: 0 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 190, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'OR' },
    testCases: [
      { inputs: { A: 1, B: 0 }, expected: 1, label: 'Card Tapped -> Unlock' },
      { inputs: { A: 0, B: 1 }, expected: 1, label: 'Officer Key -> Unlock' },
      { inputs: { A: 1, B: 1 }, expected: 1, label: 'Both Active -> Unlock' },
      { inputs: { A: 0, B: 0 }, expected: 0, label: 'Neither -> Remain Locked' },
    ],
  },
  {
    id: 'lvl-09',
    level: 9,
    chapter: 'Smart Devices',
    title: 'Laser Tag Armor Sensor',
    concept: 'Mutual Exclusion Interlock',
    lore: 'In a laser tag game, a chest target scores a point if hit by Player 1 or Player 2. But if both players fire simultaneously, the beam cross-talk cancels the score!',
    hint: 'Score 1 if strictly ONE player hits it. If BOTH or NEITHER hit it, output 0.',
    targetComponent: 'Point Scored LED',
    availableGates: ['AND', 'OR', 'XOR', 'NAND'],
    inputs: [
      { id: 'A', label: 'Laser 1', default: 1 },
      { id: 'B', label: 'Laser 2', default: 0 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 190, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'XOR' },
    testCases: [
      { inputs: { A: 1, B: 0 }, expected: 1, label: 'Player 1 Hits -> Score' },
      { inputs: { A: 0, B: 1 }, expected: 1, label: 'Player 2 Hits -> Score' },
      { inputs: { A: 1, B: 1 }, expected: 0, label: 'Both Cross Beams -> Cancel' },
      { inputs: { A: 0, B: 0 }, expected: 0, label: 'No Hits -> No Score' },
    ],
  },
  {
    id: 'lvl-10',
    level: 10,
    chapter: 'Smart Devices',
    title: 'Silent Library Green Monitor',
    concept: 'NOR Gate • Neither Allowed',
    lore: 'A quiet study room monitor shines Green (1) ONLY when there is absolute peace: NO motion detected (0) and NO noise detected (0).',
    hint: 'Outputs 1 ONLY when ALL inputs are 0. If there is ANY noise or motion, the light shuts OFF (0).',
    targetComponent: 'Peaceful Green LED',
    availableGates: ['AND', 'OR', 'NAND', 'NOR'],
    inputs: [
      { id: 'A', label: 'Motion', default: 0 },
      { id: 'B', label: 'Sound', default: 0 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 190, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'NOR' },
    testCases: [
      { inputs: { A: 0, B: 0 }, expected: 1, label: 'Zero Noise & Zero Motion -> Green' },
      { inputs: { A: 1, B: 0 }, expected: 0, label: 'Motion Detected -> Shut Off' },
      { inputs: { A: 0, B: 1 }, expected: 0, label: 'Noise Detected -> Shut Off' },
      { inputs: { A: 1, B: 1 }, expected: 0, label: 'Both Detected -> Shut Off' },
    ],
  },

  // ==========================================
  // CHAPTER 3: SILICON LOGIC (Computer Science)
  // ==========================================
  {
    id: 'lvl-11',
    level: 11,
    chapter: 'Silicon Logic',
    title: 'Binary Half-Adder: Sum Bit',
    concept: 'Binary Addition (A + B)',
    lore: 'Every CPU in the world adds numbers in binary: 0+0=0, 0+1=1, 1+0=1. But 1+1=10 (Sum is 0, Carry is 1). What gate calculates this Sum?',
    hint: 'Look at the truth table for Sum: 0 when both are 0 or both are 1; 1 when exactly one is 1.',
    targetComponent: 'Sum Bit (S)',
    availableGates: ['AND', 'OR', 'XOR', 'NAND'],
    inputs: [
      { id: 'A', label: 'Bit A', default: 1 },
      { id: 'B', label: 'Bit B', default: 1 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 190, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'XOR' },
    testCases: [
      { inputs: { A: 0, B: 0 }, expected: 0, label: '0 + 0 = 0' },
      { inputs: { A: 0, B: 1 }, expected: 1, label: '0 + 1 = 1' },
      { inputs: { A: 1, B: 0 }, expected: 1, label: '1 + 0 = 1' },
      { inputs: { A: 1, B: 1 }, expected: 0, label: '1 + 1 = 0 (carry 1)' },
    ],
  },
  {
    id: 'lvl-12',
    level: 12,
    chapter: 'Silicon Logic',
    title: 'Binary Half-Adder: Carry Bit',
    concept: 'Carry Overflow Detection',
    lore: 'When adding two bits, an overflow Carry bit (C) is generated ONLY when 1 + 1 produces 10. For all other additions (0+0, 0+1, 1+0), Carry is 0.',
    hint: 'Outputs 1 ONLY when BOTH Bit A and Bit B are 1.',
    targetComponent: 'Carry Bit (C)',
    availableGates: ['AND', 'OR', 'XOR', 'NOR'],
    inputs: [
      { id: 'A', label: 'Bit A', default: 1 },
      { id: 'B', label: 'Bit B', default: 1 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 190, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'AND' },
    testCases: [
      { inputs: { A: 1, B: 1 }, expected: 1, label: '1 + 1 -> Carry bit 1' },
      { inputs: { A: 1, B: 0 }, expected: 0, label: '1 + 0 -> No carry' },
      { inputs: { A: 0, B: 1 }, expected: 0, label: '0 + 1 -> No carry' },
      { inputs: { A: 0, B: 0 }, expected: 0, label: '0 + 0 -> No carry' },
    ],
  },
  {
    id: 'lvl-13',
    level: 13,
    chapter: 'Silicon Logic',
    title: 'Rocket Launch Abort Override',
    concept: 'Multi-Condition Safeguard',
    lore: 'Rocket engines ignite if Countdown is Complete AND Systems are Green, PROVIDED the manual Abort lever has NOT been pulled.',
    hint: 'G1 verifies that Countdown and Systems are both ready. What gate should combine that ready state with the Inverted Abort signal?',
    targetComponent: 'Main Engine Igniter',
    availableGates: ['AND', 'OR', 'XOR'],
    inputs: [
      { id: 'A', label: 'Countdown', default: 1 },
      { id: 'B', label: 'Systems', default: 1 },
      { id: 'C', label: 'Abort Pull', default: 0 },
    ],
    gates: [
      { id: 'G1', type: 'AND', isSlot: false, x: 135, y: 70 },
      { id: 'G2', type: 'NOT', isSlot: false, x: 135, y: 165 },
      { id: 'G3', type: null, isSlot: true, slotLabel: 'Gate 3', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'C', to: 'G2', pin: 0 },
      { id: 'w4', from: 'G1', to: 'G3', pin: 0 },
      { id: 'w5', from: 'G2', to: 'G3', pin: 1 },
      { id: 'w6', from: 'G3', to: 'OUT', pin: 0 },
    ],
    solution: { G3: 'AND' },
    testCases: [
      { inputs: { A: 1, B: 1, C: 0 }, expected: 1, label: 'Ready & No Abort -> LAUNCH!' },
      { inputs: { A: 1, B: 1, C: 1 }, expected: 0, label: 'Ready but Abort pulled -> HOLD' },
      { inputs: { A: 1, B: 0, C: 0 }, expected: 0, label: 'Systems not ready -> HOLD' },
      { inputs: { A: 0, B: 1, C: 0 }, expected: 0, label: 'Countdown not ready -> HOLD' },
    ],
  },
  {
    id: 'lvl-14',
    level: 14,
    chapter: 'Silicon Logic',
    title: 'Spacecraft Majority Voter',
    concept: 'Triple Modular Redundancy (TMR)',
    lore: 'Three flight computers (A, B, C) vote on a thruster pulse to protect against cosmic radiation bit-flips. Thruster fires if at least 2 of 3 computers vote YES.',
    hint: 'G1 checks (A AND B), G2 checks (B AND C). Install Gate 3 to combine them so either pair voting YES triggers the output.',
    targetComponent: 'Attitude Thruster Valve',
    availableGates: ['AND', 'OR', 'XOR'],
    inputs: [
      { id: 'A', label: 'Comp A', default: 1 },
      { id: 'B', label: 'Comp B', default: 1 },
      { id: 'C', label: 'Comp C', default: 0 },
    ],
    gates: [
      { id: 'G1', type: 'AND', isSlot: false, x: 135, y: 70 },
      { id: 'G2', type: 'AND', isSlot: false, x: 135, y: 165 },
      { id: 'G3', type: null, isSlot: true, slotLabel: 'Gate 3', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'B', to: 'G2', pin: 0 },
      { id: 'w4', from: 'C', to: 'G2', pin: 1 },
      { id: 'w5', from: 'G1', to: 'G3', pin: 0 },
      { id: 'w6', from: 'G2', to: 'G3', pin: 1 },
      { id: 'w7', from: 'G3', to: 'OUT', pin: 0 },
    ],
    solution: { G3: 'OR' },
    testCases: [
      { inputs: { A: 1, B: 1, C: 0 }, expected: 1, label: 'Computers A & B vote YES' },
      { inputs: { A: 0, B: 1, C: 1 }, expected: 1, label: 'Computers B & C vote YES' },
      { inputs: { A: 1, B: 1, C: 1 }, expected: 1, label: 'All 3 vote YES' },
      { inputs: { A: 1, B: 0, C: 0 }, expected: 0, label: 'Only A votes YES -> Rejected' },
      { inputs: { A: 0, B: 0, C: 0 }, expected: 0, label: 'None vote YES -> Rejected' },
    ],
  },
  {
    id: 'lvl-15',
    level: 15,
    chapter: 'Silicon Logic',
    title: 'Parity Bit Error Check',
    concept: 'Odd Parity Transmission',
    lore: 'Telecommunications systems send an extra Parity Bit to detect corrupt data packets. With two XOR gates in cascade, the circuit tests whether an odd number of bits are 1.',
    hint: 'G1 checks if A and B differ. Gate 2 must compare G1’s result with Bit C.',
    targetComponent: 'Parity Flag Indicator',
    availableGates: ['AND', 'OR', 'XOR', 'NOT'],
    inputs: [
      { id: 'A', label: 'Data Bit 0', default: 1 },
      { id: 'B', label: 'Data Bit 1', default: 0 },
      { id: 'C', label: 'Data Bit 2', default: 0 },
    ],
    gates: [
      { id: 'G1', type: 'XOR', isSlot: false, x: 145, y: 75 },
      { id: 'G2', type: null, isSlot: true, slotLabel: 'Gate 2', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'G2', pin: 0 },
      { id: 'w4', from: 'C', to: 'G2', pin: 1 },
      { id: 'w5', from: 'G2', to: 'OUT', pin: 0 },
    ],
    solution: { G2: 'XOR' },
    testCases: [
      { inputs: { A: 1, B: 0, C: 0 }, expected: 1, label: 'One 1 bit (Odd) -> 1' },
      { inputs: { A: 1, B: 1, C: 1 }, expected: 1, label: 'Three 1 bits (Odd) -> 1' },
      { inputs: { A: 1, B: 0, C: 1 }, expected: 0, label: 'Two 1 bits (A & C) -> 0' },
      { inputs: { A: 1, B: 1, C: 0 }, expected: 0, label: 'Two 1 bits (A & B) -> 0' },
      { inputs: { A: 0, B: 0, C: 0 }, expected: 0, label: 'Zero 1 bits (Even) -> 0' },
    ],
  },
  {
    id: 'lvl-16',
    level: 16,
    chapter: 'Silicon Logic',
    title: 'Digital Multiplexer (Selector)',
    concept: 'Route Data Stream',
    lore: 'A multiplexer routes one of two audio tracks (A or B) depending on the Select switch (S). If S=0, Track A plays; if S=1, Track B plays.',
    hint: 'G1 inverts S for Track A. G2 passes Track A when S=0. What gate combines the outputs of Track A and Track B so the selected track reaches the speakers?',
    targetComponent: 'Speaker Audio Channel',
    availableGates: ['AND', 'OR', 'XOR'],
    inputs: [
      { id: 'A', label: 'Track A', default: 1 },
      { id: 'B', label: 'Track B', default: 0 },
      { id: 'S', label: 'Select S', default: 0 },
    ],
    gates: [
      { id: 'G1', type: 'NOT', isSlot: false, x: 110, y: 55 },
      { id: 'G2', type: 'AND', isSlot: false, x: 185, y: 65 },
      { id: 'G3', type: 'AND', isSlot: false, x: 185, y: 165 },
      { id: 'G4', type: null, isSlot: true, slotLabel: 'Gate 4', x: 280, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'S', to: 'G1', pin: 0 },
      { id: 'w2', from: 'A', to: 'G2', pin: 0 },
      { id: 'w3', from: 'G1', to: 'G2', pin: 1 },
      { id: 'w4', from: 'B', to: 'G3', pin: 0 },
      { id: 'w5', from: 'S', to: 'G3', pin: 1 },
      { id: 'w6', from: 'G2', to: 'G4', pin: 0 },
      { id: 'w7', from: 'G3', to: 'G4', pin: 1 },
      { id: 'w8', from: 'G4', to: 'OUT', pin: 0 },
    ],
    solution: { G4: 'OR' },
    testCases: [
      { inputs: { A: 1, B: 0, S: 0 }, expected: 1, label: 'S=0 selects Track A (1)' },
      { inputs: { A: 0, B: 1, S: 0 }, expected: 0, label: 'S=0 selects Track A (0)' },
      { inputs: { A: 0, B: 1, S: 1 }, expected: 1, label: 'S=1 selects Track B (1)' },
      { inputs: { A: 1, B: 0, S: 1 }, expected: 0, label: 'S=1 selects Track B (0)' },
    ],
  },

  // ==========================================
  // CHAPTER 4: CYBER ARCHITECT (Master Class)
  // ==========================================
  {
    id: 'lvl-17',
    level: 17,
    chapter: 'Cyber Architect',
    title: 'De Morgan’s Secret Theorem',
    concept: 'Transforming Silicon Cells',
    lore: 'Augustus De Morgan proved in 1847 that NOT(A OR B) is mathematically identical to (NOT A) AND (NOT B). Complete the NOR equivalent circuit.',
    hint: 'G1 and G2 invert both inputs. What gate combines the inverted signals to mirror a NOR gate?',
    targetComponent: 'Equivalent Logic Diode',
    availableGates: ['AND', 'OR', 'XOR', 'NAND'],
    inputs: [
      { id: 'A', label: 'Signal A', default: 0 },
      { id: 'B', label: 'Signal B', default: 0 },
    ],
    gates: [
      { id: 'G1', type: 'NOT', isSlot: false, x: 135, y: 70 },
      { id: 'G2', type: 'NOT', isSlot: false, x: 135, y: 165 },
      { id: 'G3', type: null, isSlot: true, slotLabel: 'Gate 3', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G2', pin: 0 },
      { id: 'w3', from: 'G1', to: 'G3', pin: 0 },
      { id: 'w4', from: 'G2', to: 'G3', pin: 1 },
      { id: 'w5', from: 'G3', to: 'OUT', pin: 0 },
    ],
    solution: { G3: 'AND' },
    testCases: [
      { inputs: { A: 0, B: 0 }, expected: 1, label: 'Both 0 -> Output 1' },
      { inputs: { A: 1, B: 0 }, expected: 0, label: 'A is 1 -> Output 0' },
      { inputs: { A: 0, B: 1 }, expected: 0, label: 'B is 1 -> Output 0' },
      { inputs: { A: 1, B: 1 }, expected: 0, label: 'Both 1 -> Output 0' },
    ],
  },
  {
    id: 'lvl-18',
    level: 18,
    chapter: 'Cyber Architect',
    title: 'Self-Driving Vehicle Collision Brake',
    concept: '2-Slot Circuit Assembly',
    lore: 'An autonomous vehicle emergency brake triggers if an Obstacle is detected in path, AND the Car is in Motion, UNLESS the Reverse gear is engaged.',
    hint: 'Slot 1 must combine Obstacle and Motion. Slot 2 must combine that threat with the inverted Reverse signal.',
    targetComponent: 'Hydraulic ABS Brake Actuator',
    availableGates: ['AND', 'OR', 'XOR', 'NOT'],
    inputs: [
      { id: 'A', label: 'Obstacle', default: 1 },
      { id: 'B', label: 'Moving', default: 1 },
      { id: 'C', label: 'Reverse', default: 0 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 135, y: 70 },
      { id: 'G2', type: 'NOT', isSlot: false, x: 135, y: 165 },
      { id: 'G3', type: null, isSlot: true, slotLabel: 'Gate 2', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'C', to: 'G2', pin: 0 },
      { id: 'w4', from: 'G1', to: 'G3', pin: 0 },
      { id: 'w5', from: 'G2', to: 'G3', pin: 1 },
      { id: 'w6', from: 'G3', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'AND', G3: 'AND' },
    testCases: [
      { inputs: { A: 1, B: 1, C: 0 }, expected: 1, label: 'Obstacle + Forward -> BRAKE!' },
      { inputs: { A: 1, B: 1, C: 1 }, expected: 0, label: 'Obstacle + In Reverse -> OK' },
      { inputs: { A: 0, B: 1, C: 0 }, expected: 0, label: 'Clear path -> OK' },
      { inputs: { A: 1, B: 0, C: 0 }, expected: 0, label: 'Obstacle but Stopped -> OK' },
    ],
  },
  {
    id: 'lvl-19',
    level: 19,
    chapter: 'Cyber Architect',
    title: 'Universal NAND Logic Cell',
    concept: 'NAND Completeness',
    lore: 'The Apollo Guidance Computer was built purely out of NAND/NOR gates because they are universal: any digital logic function can be created using only them!',
    hint: 'G1 inverts signal A using NAND. What gate combines G1 with input B to output 1 only when A is 0 AND B is 1?',
    targetComponent: 'Silicon Apollo Cell',
    availableGates: ['AND', 'OR', 'XOR', 'NAND'],
    inputs: [
      { id: 'A', label: 'Signal A', default: 0 },
      { id: 'B', label: 'Signal B', default: 1 },
    ],
    gates: [
      { id: 'G1', type: 'NAND', isSlot: false, x: 135, y: 70 },
      { id: 'G2', type: null, isSlot: true, slotLabel: 'Gate 2', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'A', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'G2', pin: 0 },
      { id: 'w4', from: 'B', to: 'G2', pin: 1 },
      { id: 'w5', from: 'G2', to: 'OUT', pin: 0 },
    ],
    solution: { G2: 'AND' },
    testCases: [
      { inputs: { A: 0, B: 1 }, expected: 1, label: 'A=0 (G1=1) & B=1 -> 1' },
      { inputs: { A: 1, B: 1 }, expected: 0, label: 'A=1 (G1=0) & B=1 -> 0' },
      { inputs: { A: 0, B: 0 }, expected: 0, label: 'A=0 (G1=1) & B=0 -> 0' },
      { inputs: { A: 1, B: 0 }, expected: 0, label: 'A=1 (G1=0) & B=0 -> 0' },
    ],
  },
  {
    id: 'lvl-20',
    level: 20,
    chapter: 'Cyber Architect',
    title: 'Quantum Core Magnetic Containment',
    concept: 'Dual Slot Masterpiece',
    lore: 'A fusion reactor magnetic bottle stabilizes (1) when Field Coil A and B are synchronized (XOR fails, AND passes), OR when Backup Stabilizer C is active.',
    hint: 'Slot 1 monitors the primary coils. Slot 2 allows the backup stabilizer to engage.',
    targetComponent: 'Plasma Containment Field',
    availableGates: ['AND', 'OR', 'XOR', 'NAND', 'NOR'],
    inputs: [
      { id: 'A', label: 'Coil A', default: 1 },
      { id: 'B', label: 'Coil B', default: 1 },
      { id: 'C', label: 'Backup C', default: 0 },
    ],
    gates: [
      { id: 'G1', type: null, isSlot: true, slotLabel: 'Gate 1', x: 145, y: 75 },
      { id: 'G2', type: null, isSlot: true, slotLabel: 'Gate 2', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'G2', pin: 0 },
      { id: 'w4', from: 'C', to: 'G2', pin: 1 },
      { id: 'w5', from: 'G2', to: 'OUT', pin: 0 },
    ],
    solution: { G1: 'AND', G2: 'OR' },
    testCases: [
      { inputs: { A: 1, B: 1, C: 0 }, expected: 1, label: 'Primary Coils Active -> Stable' },
      { inputs: { A: 1, B: 1, C: 1 }, expected: 1, label: 'Both Coils & Backup ON -> Stable' },
      { inputs: { A: 0, B: 0, C: 1 }, expected: 1, label: 'Backup C Active -> Stable' },
      { inputs: { A: 1, B: 0, C: 1 }, expected: 1, label: 'Coil A + Backup C -> Stable' },
      { inputs: { A: 1, B: 0, C: 0 }, expected: 0, label: 'Unbalanced Coils, No Backup -> Unstable' },
      { inputs: { A: 0, B: 0, C: 0 }, expected: 0, label: 'All Off -> Unstable' },
    ],
  },
  {
    id: 'lvl-21',
    level: 21,
    chapter: 'Cyber Architect',
    title: 'Bletchley Cypher Decryption Cell',
    concept: '3-Input Dual Gate Mesh',
    lore: 'Inspired by Alan Turing’s cryptanalysis rotors: decode the encrypted bitstream when either Cypher Bit A or B matches the codebook, provided the Key Inversion C is clear.',
    hint: 'G1 checks if A or B is active. G2 verifies Key C.',
    targetComponent: 'Decrypted Teleprinter Output',
    availableGates: ['AND', 'OR', 'XOR', 'NOT'],
    inputs: [
      { id: 'A', label: 'Cypher A', default: 1 },
      { id: 'B', label: 'Cypher B', default: 0 },
      { id: 'C', label: 'Key C', default: 1 },
    ],
    gates: [
      { id: 'G1', type: 'XOR', isSlot: false, x: 135, y: 70 },
      { id: 'G2', type: null, isSlot: true, slotLabel: 'Gate 2', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'G1', to: 'G2', pin: 0 },
      { id: 'w4', from: 'C', to: 'G2', pin: 1 },
      { id: 'w5', from: 'G2', to: 'OUT', pin: 0 },
    ],
    solution: { G2: 'AND' },
    testCases: [
      { inputs: { A: 1, B: 0, C: 1 }, expected: 1, label: 'XOR match (A) AND Key C' },
      { inputs: { A: 0, B: 1, C: 1 }, expected: 1, label: 'XOR match (B) AND Key C' },
      { inputs: { A: 1, B: 1, C: 1 }, expected: 0, label: 'Both A & B active -> XOR 0' },
      { inputs: { A: 1, B: 0, C: 0 }, expected: 0, label: 'Key C missing -> 0' },
    ],
  },
  {
    id: 'lvl-22',
    level: 22,
    chapter: 'Cyber Architect',
    title: 'Superconducting Qubit Flux Trap',
    concept: 'High-Density Logic Interlock',
    lore: 'Quantum computing Josephson junctions trap magnetic flux quanta if Sensor A and B differ, AND Sensor C and D also differ.',
    hint: 'G1 is an XOR gate. Slot G2 checks C and D. Slot G3 ensures both differential conditions are met simultaneously.',
    targetComponent: 'Josephson Flux Quantum Trap',
    availableGates: ['AND', 'OR', 'XOR', 'NAND'],
    inputs: [
      { id: 'A', label: 'Qubit A', default: 1 },
      { id: 'B', label: 'Qubit B', default: 0 },
      { id: 'C', label: 'Qubit C', default: 0 },
      { id: 'D', label: 'Qubit D', default: 1 },
    ],
    gates: [
      { id: 'G1', type: 'XOR', isSlot: false, x: 135, y: 65 },
      { id: 'G2', type: null, isSlot: true, slotLabel: 'Gate 2', x: 135, y: 165 },
      { id: 'G3', type: null, isSlot: true, slotLabel: 'Gate 3', x: 265, y: 115 },
    ],
    wires: [
      { id: 'w1', from: 'A', to: 'G1', pin: 0 },
      { id: 'w2', from: 'B', to: 'G1', pin: 1 },
      { id: 'w3', from: 'C', to: 'G2', pin: 0 },
      { id: 'w4', from: 'D', to: 'G2', pin: 1 },
      { id: 'w5', from: 'G1', to: 'G3', pin: 0 },
      { id: 'w6', from: 'G2', to: 'G3', pin: 1 },
      { id: 'w7', from: 'G3', to: 'OUT', pin: 0 },
    ],
    solution: { G2: 'XOR', G3: 'AND' },
    testCases: [
      { inputs: { A: 1, B: 0, C: 0, D: 1 }, expected: 1, label: 'Both pairs differ -> Trapped' },
      { inputs: { A: 0, B: 1, C: 1, D: 0 }, expected: 1, label: 'Both pairs differ -> Trapped' },
      { inputs: { A: 1, B: 0, C: 0, D: 0 }, expected: 0, label: 'C and D both 0 -> Untrapped' },
      { inputs: { A: 1, B: 1, C: 0, D: 1 }, expected: 0, label: 'A and B match -> Untrapped' },
      { inputs: { A: 1, B: 0, C: 1, D: 1 }, expected: 0, label: 'C and D match -> Untrapped' },
    ],
  },
];

/**
 * Evaluates the circuit state with player-chosen gates inserted into slots.
 *
 * @param {Object} puzzle - The puzzle definition
 * @param {Object} slottedGates - Map of { gateId: 'AND' | 'OR' | ... }
 * @param {Object} inputValues - Current values of inputs e.g. { A: 1, B: 0 }
 * @returns {Object} evaluation results { inputs, gateOutputs, wireStates, output, isComplete }
 */
export function evaluateCircuit(puzzle, slottedGates = {}, inputValues = {}) {
  // 1. Resolve inputs
  const inputs = {};
  for (const inp of puzzle.inputs) {
    inputs[inp.id] = (inp.id in inputValues) ? (inputValues[inp.id] ? 1 : 0) : (inp.default ?? 0);
  }

  // 2. Evaluate gates topologically
  const nodeValues = { ...inputs };
  const gateOutputs = {};

  for (const gate of puzzle.gates) {
    // Determine effective gate type: fixed type or slotted type
    const effectiveType = gate.isSlot ? slottedGates[gate.id] : gate.type;

    if (!effectiveType) {
      // Slot is empty
      gateOutputs[gate.id] = null;
      nodeValues[gate.id] = 0;
      continue;
    }

    // Find incoming input values from wires
    const inWires = (puzzle.wires || []).filter(w => w.to === gate.id).sort((a, b) => (a.pin || 0) - (b.pin || 0));
    const inVals = inWires.map(w => nodeValues[w.from] ?? 0);

    let out = 0;
    switch (effectiveType) {
      case 'AND':
        out = inVals.length > 0 && inVals.every(v => v === 1) ? 1 : 0;
        break;
      case 'OR':
        out = inVals.some(v => v === 1) ? 1 : 0;
        break;
      case 'XOR':
        out = inVals.reduce((acc, v) => acc ^ v, 0);
        break;
      case 'NOT':
        out = (inVals[0] === 1) ? 0 : 1;
        break;
      case 'NAND':
        out = (inVals.length > 0 && inVals.every(v => v === 1)) ? 0 : 1;
        break;
      case 'NOR':
        out = inVals.some(v => v === 1) ? 0 : 1;
        break;
      default:
        out = 0;
    }

    gateOutputs[gate.id] = out;
    nodeValues[gate.id] = out;
  }

  // 3. Compute wire states
  const wireStates = {};
  if (puzzle.wires) {
    for (const wire of puzzle.wires) {
      wireStates[wire.id] = nodeValues[wire.from] ?? 0;
    }
  }

  // 4. Output signal (wire connecting to 'OUT')
  const outWire = (puzzle.wires || []).find(w => w.to === 'OUT');
  const output = outWire ? (nodeValues[outWire.from] ?? 0) : 0;

  // Check if all slots are filled
  const slotGates = puzzle.gates.filter(g => g.isSlot);
  const allSlotsFilled = slotGates.every(g => Boolean(slottedGates[g.id]));

  return {
    inputs,
    gateOutputs,
    wireStates,
    output,
    allSlotsFilled,
  };
}

/**
 * Verify whether player's slotted gates satisfy all test cases for this puzzle.
 *
 * @param {Object} puzzle - The puzzle
 * @param {Object} slottedGates - Map of { gateId: 'AND' | ... }
 * @returns {Object} { isSolved, testResults, failedCase }
 */
export function verifyAllTestCases(puzzle, slottedGates = {}) {
  const slotGates = puzzle.gates.filter(g => g.isSlot);
  const allSlotsFilled = slotGates.every(g => Boolean(slottedGates[g.id]));

  if (!allSlotsFilled) {
    return {
      isSolved: false,
      allSlotsFilled: false,
      testResults: puzzle.testCases.map(tc => ({
        ...tc,
        actual: null,
        passed: false,
      })),
      failedCase: null,
    };
  }

  const testResults = puzzle.testCases.map(tc => {
    const res = evaluateCircuit(puzzle, slottedGates, tc.inputs);
    const passed = res.output === tc.expected;
    return {
      ...tc,
      actual: res.output,
      passed,
    };
  });

  const isSolved = testResults.every(r => r.passed);
  const failedCase = testResults.find(r => !r.passed) || null;

  return {
    isSolved,
    allSlotsFilled: true,
    testResults,
    failedCase,
  };
}

/**
 * Deterministic PRNG helper for seed-based daily mode
 */
function seededShuffle(array, prng) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick 3 daily puzzles for the given PRNG
 */
export function getDailyPuzzles(prng) {
  const tier1 = PUZZLES.filter(p => p.level <= 6);
  const tier2 = PUZZLES.filter(p => p.level > 6 && p.level <= 14);
  const tier3 = PUZZLES.filter(p => p.level > 14);

  const p1 = seededShuffle(tier1, prng)[0];
  const p2 = seededShuffle(tier2, prng)[0];
  const p3 = seededShuffle(tier3, prng)[0];

  return [p1, p2, p3];
}

/**
 * Pick a random puzzle for Blitz mode, scaling with current streak
 */
export function getBlitzPuzzle(streak = 0, prng = Math.random) {
  let pool = PUZZLES;
  if (streak < 2) {
    pool = PUZZLES.filter(p => p.level <= 8);
  } else if (streak < 5) {
    pool = PUZZLES.filter(p => p.level <= 16);
  }
  const idx = Math.floor(prng() * pool.length);
  return pool[idx];
}

export const CIRCUITS = PUZZLES;

export function generateGameRounds(prng = Math.random) {
  return getDailyPuzzles(prng);
}

export function calculateRoundScore(circuit, timeRemaining, totalTime) {
  const baseScore = 1000;
  const timeBonus = Math.round((Math.max(0, timeRemaining) / Math.max(1, totalTime)) * 500);
  return baseScore + timeBonus;
}

