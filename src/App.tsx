/* eslint-disable no-loop-func */
import React, { useState } from 'react';
import './App.css';

const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
const innings = [1, 2, 3, 4, 5];
const fullRoster = [
  'Agastya',
  'Alexander',
  'Cam',
  'Casey',
  'EJ',
  'Lane',
  'Lee',
  'Lincoln',
  'Miles',
  'Oliver',
  'Roy',
];

function App() {
  // State and handlers for the component
  const [activePlayers, setActivePlayers] = useState<string[]>(fullRoster);
  const [pitchers, setPitchers] = useState<{[slot: number]: string}>({1: '', 2: '', 3: ''});
  const [catchers, setCatchers] = useState<{[slot: number]: string}>({1: '', 2: '', 3: ''});
  const [lineup, setLineup] = useState<{ [inning: number]: { [pos: string]: string } }>(() => {
    const initial: any = {};
    innings.forEach((inn) => {
      initial[inn] = {};
      positions.forEach((pos) => {
        initial[inn][pos] = '';
      });
    });
    return initial;
  });

  // Remove all auth state and logic

  // Handle active player selection
  function togglePlayer(player: string) {
    setActivePlayers((prev) =>
      prev.includes(player) ? prev.filter((p) => p !== player) : [...prev, player]
    );
  }

  // Handle pitcher/catcher selection
  function handlePitcherChange(slot: number, value: string) {
    setPitchers((prev) => ({ ...prev, [slot]: value }));
  }
  function handleCatcherChange(slot: number, value: string) {
    setCatchers((prev) => ({ ...prev, [slot]: value }));
  }

  // Fix: Rename handleLineupChange to handleInputChange for lineup entry
  function handleInputChange(inning: number, pos: string, value: string) {
    setLineup((prev) => ({
      ...prev,
      [inning]: { ...prev[inning], [pos]: value },
    }));
  }

  // Validation logic for Step 1 (Position Grid Check) - now returns errors instead of setting state
  function validateStep1All(lineupToCheck: typeof lineup, activePlayersToCheck: string[]) {
    const errs: string[] = [];
    innings.forEach((inn) => {
      const players = positions.map((pos) => lineupToCheck[inn][pos].trim()).filter(Boolean);
      if (players.length !== 9) {
        errs.push(`Inning ${inn}: Not all 9 positions filled.`);
      }
      const uniquePlayers = new Set(players);
      if (uniquePlayers.size !== players.length) {
        errs.push(`Inning ${inn}: Duplicate player(s) in positions.`);
      }
      // Check for players not in activePlayers
      players.forEach((p) => {
        if (!activePlayersToCheck.includes(p)) {
          errs.push(`Inning ${inn}: ${p} is not on the active roster.`);
        }
      });
    });
    return errs;
  }

  // Run all validations and collect results
  function getAllValidationResults(this: any) {
    // Use either passed in lineup via 'this' context or component state
    const currentLineup = (this && this.lineup) || lineup;
    const currentActivePlayers = (this && this.activePlayers) || activePlayers;
    
    const results: { step: string; errors: string[] }[] = [];
    // Step 1
    results.push({ step: 'Position Grid Check', errors: validateStep1All(currentLineup, currentActivePlayers) });
    // Step 2
    const errs2: string[] = [];
    // Pitching Requirements
    const pitcherSlots = [
      { slot: 1, innings: [1, 2] },
      { slot: 2, innings: [3, 4] },
      { slot: 3, innings: [5] },
    ];
    const usedPitchers = new Set<string>();
    pitcherSlots.forEach(({ slot, innings }) => {
      const pitcher = pitchers[slot];
      if (!pitcher) {
        errs2.push(`Pitcher slot ${slot} not assigned.`);
        return;
      }
      if (usedPitchers.has(pitcher)) {
        errs2.push(`Pitcher ${pitcher} assigned to multiple slots.`);
      }
      usedPitchers.add(pitcher);
      innings.forEach((inn) => {
        if (lineup[inn]['P'] !== pitcher) {
          errs2.push(`Inning ${inn}: Pitcher should be ${pitcher}.`);
        }
      });
    });
    results.push({ step: 'Pitching Requirements', errors: errs2 });
    // Step 3
    const errs3: string[] = [];
    const catcherSlots = [
      { slot: 1, innings: [1, 2] },
      { slot: 2, innings: [3, 4] },
      { slot: 3, innings: [5] },
    ];
    const usedCatchers = new Set<string>();
    catcherSlots.forEach(({ slot, innings }) => {
      const catcher = catchers[slot];
      if (!catcher) {
        errs3.push(`Catcher slot ${slot} not assigned.`);
        return;
      }
      if (usedCatchers.has(catcher)) {
        errs3.push(`Catcher ${catcher} assigned to multiple slots.`);
      }
      usedCatchers.add(catcher);
      innings.forEach((inn) => {
        if (lineup[inn]['C'] !== catcher) {
          errs3.push(`Inning ${inn}: Catcher should be ${catcher}.`);
        }
      });
    });
    results.push({ step: 'Catching Requirements', errors: errs3 });
    // Step 4
    const errs4: string[] = [];
    const infieldPositions = ['P', 'C', '1B', '2B', '3B', 'SS'];
    const playerInfieldCounts: { [player: string]: number } = {};
    activePlayers.forEach((p) => (playerInfieldCounts[p] = 0));
    for (let inn = 1; inn <= 4; inn++) {
      infieldPositions.forEach((pos) => {
        const player = lineup[inn][pos];
        if (player && playerInfieldCounts[player] !== undefined) {
          playerInfieldCounts[player]++;
        }
      });
    }
    Object.entries(playerInfieldCounts).forEach(([player, count]) => {
      if (count < 2) {
        errs4.push(`${player} has only ${count} infield positions by end of inning 4.`);
      }
    });
    results.push({ step: 'Infield Position Count', errors: errs4 });
    // Step 5
    const errs5: string[] = [];
    activePlayers.forEach((player) => {
      let lastPos = '';
      for (let inn = 1; inn <= 5; inn++) {
        let pos = '';
        for (const p of positions) {
          if (lineup[inn][p] === player) {
            pos = p;
            break;
          }
        }
        if (pos && lastPos === pos) {
          // Exception: pitcher/catcher during their assigned innings
          const isPitcher = pos === 'P' &&
            ((pitchers[1] === player && (inn === 1 || inn === 2)) ||
             (pitchers[2] === player && (inn === 3 || inn === 4)) ||
             (pitchers[3] === player && inn === 5));
          const isCatcher = pos === 'C' &&
            ((catchers[1] === player && (inn === 1 || inn === 2)) ||
             (catchers[2] === player && (inn === 3 || inn === 4)) ||
             (catchers[3] === player && inn === 5));
          if (!isPitcher && !isCatcher) {
            errs5.push(`${player} plays ${pos} in consecutive innings (${inn - 1} & ${inn}).`);
          }
        }
        lastPos = pos;
      }
    });
    results.push({ step: 'Consecutive Position Rule', errors: errs5 });
    // Step 6
    const errs6: string[] = [];
    activePlayers.forEach((player) => {
      let consecutiveBench = 0;
      for (let inn = 1; inn <= 5; inn++) {
        const isBenched = !positions.some((pos) => lineup[inn][pos] === player);
        if (isBenched) {
          consecutiveBench++;
          if (consecutiveBench > 1) {
            errs6.push(`${player} sits consecutive innings (${inn - 1} & ${inn}).`);
          }
        } else {
          consecutiveBench = 0;
        }
      }
    });
    results.push({ step: 'Bench Rotation', errors: errs6 });
    return results;
  }

  // Get validation results (no memoization needed)
  const validationResults = getAllValidationResults();

  // Improved auto-generate lineup implementation follows...

  // Improved auto-generate lineup: ensure all players get 2 infield positions by inning 4 (robust)
  function autoGenerateLineup() {
    const maxAttempts = 200;
    let attempt = 0;
    let newLineup: { [inning: number]: { [pos: string]: string } } = {};
    let valid = false;

    while (attempt < maxAttempts && !valid) {
      console.log(`Attempt #${attempt + 1}`);
      newLineup = {};
      const outfieldPositions = ['LF', 'CF', 'RF'];
      const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
      console.log('Shuffled activePlayers:', shuffled);
      
      // Precompute pitcher/catcher for each inning
      const pitcherByInning: { [inn: number]: string } = {};
      const catcherByInning: { [inn: number]: string } = {};

      // Map innings to pitcher/catcher slots
      [1, 2].forEach(inn => {
        pitcherByInning[inn] = pitchers[1];
        catcherByInning[inn] = catchers[1];
      });
      [3, 4].forEach(inn => {
        pitcherByInning[inn] = pitchers[2];
        catcherByInning[inn] = catchers[2];
      });
      pitcherByInning[5] = pitchers[3];
      catcherByInning[5] = catchers[3];

      // Calculate how many infield positions each player needs
      const playerInfieldNeeds: { [player: string]: number } = {};
      shuffled.forEach(p => {
        playerInfieldNeeds[p] = 2;
        // Subtract P/C assignments from needed infield positions
        for (let inn = 1; inn <= 4; inn++) {
          if (pitcherByInning[inn] === p || catcherByInning[inn] === p) {
            playerInfieldNeeds[p]--;
          }
        }
      });

      // Create list of infield slots to fill (excluding P/C)
      const infieldSlots: { inn: number; pos: string }[] = [];
      for (let inn = 1; inn <= 4; inn++) {
        ['1B', '2B', '3B', 'SS'].forEach(pos => infieldSlots.push({ inn, pos }));
      }
      
      // Track assignments per player
      let slotAssignments: { [player: string]: { inn: number; pos: string }[] } = {};
      shuffled.forEach(p => (slotAssignments[p] = []));

      // First pass: assign players who still need 2 positions, prioritizing P/C players
      let availableSlots = [...infieldSlots];
      
      // Sort players by priority - P/C for innings 1-4 first, then others
      const playersByPriority = [...shuffled].sort((a, b) => {
        // Count how many P/C assignments each player has in innings 1-4
        const aPC = [1,2,3,4].filter(inn => 
          pitcherByInning[inn] === a || catcherByInning[inn] === a
        ).length;
        const bPC = [1,2,3,4].filter(inn => 
          pitcherByInning[inn] === b || catcherByInning[inn] === b
        ).length;
        // Prioritize players with more P/C assignments in innings 1-4
        if (aPC > bPC) return -1;
        if (bPC > aPC) return 1;
        return 0;
      });

      for (const player of playersByPriority) {
        while (playerInfieldNeeds[player] > 0 && availableSlots.length > 0) {
          // Find valid slots for this player
          const validSlots = availableSlots.filter(slot => {
            // Can't play if already pitching/catching that inning
            if (pitcherByInning[slot.inn] === player || catcherByInning[slot.inn] === player) return false;
            // Can't play same position in consecutive innings
            const hasConsecutive = slotAssignments[player].some(prev => 
              prev.pos === slot.pos && Math.abs(prev.inn - slot.inn) === 1
            );
            if (hasConsecutive) return false;
            // Can't play twice in same inning
            const hasInning = slotAssignments[player].some(prev => prev.inn === slot.inn);
            return !hasInning;
          });

          if (validSlots.length > 0) {
            const slot = validSlots[Math.floor(Math.random() * validSlots.length)];
            slotAssignments[player].push(slot);
            playerInfieldNeeds[player]--;
            availableSlots = availableSlots.filter(s => !(s.inn === slot.inn && s.pos === slot.pos));
          } else {
            break; // No valid slots found for this player
          }
        }
      }
      console.log('Slot assignments:', JSON.parse(JSON.stringify(slotAssignments)));

      // Build the lineup inning by inning
      let failed = false;
      // Helper to get previous inning's lineup for a position
      const getPrevInningPlayer = (lineupState: any, inning: number, pos: string) => {
        return inning > 1 && lineupState[inning - 1] ? lineupState[inning - 1][pos] : null;
      };
      // Infield eligibility helper (moved outside loop to fix no-loop-func)
      const isEligibleInfield = (p: string, used: Set<string>, prevInningPlayer: string | null) => {
        if (used.has(p)) return false;
        return prevInningPlayer !== p;
      };
      // Outfield eligibility helpers
      const isEligibleSatOut = (p: string, usedSet: Set<string>, lineupState: any, inning: number, pos: string) => {
        return !usedSet.has(p) && getPrevInningPlayer(lineupState, inning, pos) !== p;
      };
      const isEligibleOutfield = (p: string, usedSet: Set<string>, lineupState: any, inning: number, pos: string) => {
        if (usedSet.has(p)) return false;
        return getPrevInningPlayer(lineupState, inning, pos) !== p;
      };

      for (let inn = 1; inn <= 5; inn++) {
        const currentLineupState = { ...newLineup };  // Capture current state
        newLineup[inn] = {};
        
        // 1. Assign pitcher and catcher (predetermined)
        newLineup[inn]['P'] = pitcherByInning[inn];
        newLineup[inn]['C'] = catcherByInning[inn];
        
        const used = new Set([pitcherByInning[inn], catcherByInning[inn]]);
        
        // 2. For innings 1-4, assign infield positions from slotAssignments
        if (inn <= 4) {
          for (const pos of ['1B', '2B', '3B', 'SS']) {
            // Find player assigned to this slot
            let assignedPlayer = '';
            const currentState = { ...currentLineupState };  // Use captured state
            
            for (const [player, slots] of Object.entries(slotAssignments)) {
              if (slots.some(s => s.inn === inn && s.pos === pos)) {
                assignedPlayer = player;
                break;
              }
            }
            
            if (assignedPlayer) {
              newLineup[inn][pos] = assignedPlayer;
              used.add(assignedPlayer);
            } else {
              // Find eligible player who hasn't played this position in adjacent innings
              const prevInning = inn > 1 ? currentState[inn - 1][pos] : null;
              // eslint-disable-next-line no-loop-func
              const eligible = shuffled.filter(p => isEligibleInfield(p, used, prevInning));
              
              if (eligible.length === 0) {
                failed = true;
                break;
              }
              
              const pick = eligible[Math.floor(Math.random() * eligible.length)];
              newLineup[inn][pos] = pick;
              used.add(pick);
            }
          }
        } else {
          // For inning 5, just ensure no consecutive positions
          for (const pos of ['1B', '2B', '3B', 'SS']) {
            const prevInning = currentLineupState[inn - 1][pos];
            // eslint-disable-next-line no-loop-func
            const eligible = shuffled.filter(p => isEligibleInfield(p, used, prevInning));
            
            if (eligible.length === 0) {
              failed = true;
              break;
            }
            
            const pick = eligible[Math.floor(Math.random() * eligible.length)];
            newLineup[inn][pos] = pick;
            used.add(pick);
          }
        }
        
        if (failed) break;
        // Assign outfield positions
        const outfieldPool = shuffled.filter(p => !used.has(p));
        // Try to assign players who sat last inning first
        const satLastInning = inn > 1 ? 
          shuffled.filter(p => !Object.values(currentLineupState[inn - 1]).includes(p)) : [];
        for (const pos of outfieldPositions) {
          const eligibleSatOut = satLastInning.filter(p => isEligibleSatOut(p, used, newLineup, inn, pos));
          const eligible = eligibleSatOut.length > 0 ? eligibleSatOut : 
            outfieldPool.filter(p => isEligibleOutfield(p, used, newLineup, inn, pos));
          if (eligible.length === 0) {
            failed = true;
            break;
          }
          const pick = eligible[Math.floor(Math.random() * eligible.length)];
          newLineup[inn][pos] = pick;
          used.add(pick);
        }
        if (failed) break;
      }

      if (failed) {
        console.log('Lineup build failed, retrying...');
        attempt++;
        continue;
      }

      // Verify infield position counts for innings 1-4
      const finalInfieldCounts: { [player: string]: number } = {};
      const slotCounts: { [player: string]: number } = {};
      
      // First count only from slot assignments (1B, 2B, 3B, SS)
      shuffled.forEach(p => {
        finalInfieldCounts[p] = 0;
        slotCounts[p] = slotAssignments[p].length;
      });

      // Then add P/C assignments for innings 1-4
      for (let inn = 1; inn <= 4; inn++) {
        const pitcher = pitcherByInning[inn];
        const catcher = catcherByInning[inn];
        if (pitcher) finalInfieldCounts[pitcher]++;
        if (catcher) finalInfieldCounts[catcher]++;
      }

      // Combine counts
      shuffled.forEach(p => {
        finalInfieldCounts[p] += slotCounts[p];
      });
      
      console.log('Final infield position counts:', finalInfieldCounts);
      console.log('P/C assignments:', {
        pitchers: pitcherByInning,
        catchers: catcherByInning
      });

      const allHave2 = Object.entries(finalInfieldCounts).every(([player, count]) => count >= 2);
      if (!allHave2) {
        console.log('Not all players have 2 infield positions:', finalInfieldCounts);
        attempt++;
        continue;
      }

      // Set the lineup and then validate it
      setLineup(newLineup);
      
      // Do validation after setting the lineup
      const validationResults = getAllValidationResults();
      valid = validationResults.every((res) => res.errors.length === 0);
      
      if (!valid) {
        console.log('Validation failed:', validationResults);
        attempt++;
        continue;
      }
      
      // If we got here, we have a valid lineup
      console.log('Successfully generated lineup:', newLineup);
      break;
    }

    if (!valid) {
      console.log('Final failure: could not generate valid lineup.');
      return;
    }
    console.log('Successfully generated lineup:', newLineup);
  }

  function exportLineup() {
    // Create a player -> positions map
    const playerPositions: { [player: string]: string[] } = {};
    
    // Initialize array for each active player
    activePlayers.forEach(player => {
      playerPositions[player] = [];
    });

    // For each inning, record each player's position
    for (let inn = 1; inn <= 5; inn++) {
      // Find what position each player is playing this inning
      activePlayers.forEach(player => {
        const position = Object.entries(lineup[inn]).find(([pos, name]) => name === player)?.[0] || '';
        playerPositions[player].push(position);
      });
    }

    // Convert to tab-separated format
    const lines = Object.entries(playerPositions)
      .filter(([_, positions]) => positions.some(pos => pos)) // Only include players with at least one position
      .map(([player, positions]) => {
        return [player, ...positions].join('\t');
      })
      .join('\n');

    // Copy to clipboard
    navigator.clipboard.writeText(lines).then(() => {
      alert('Lineup copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy lineup:', err);
      alert('Failed to copy lineup to clipboard');
    });
  }

  function getInfieldInnings(player: string): number {
    let count = 0;
    const infieldPositions = ['P', 'C', '1B', '2B', '3B', 'SS'];
    
    // Count all innings where player is in an infield position
    for (let inn = 1; inn <= 5; inn++) {
      for (const pos of infieldPositions) {
        if (lineup[inn][pos] === player) {
          count++;
          break; // Only count once per inning
        }
      }
    }
    return count;
  }

  return (
    <div className="App">
      <div className="roster-section">
        <h1>Coach Helper</h1>
        <h2>Active Players</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {fullRoster.map((player) => (
            <label key={player}>
              <input
                type="checkbox"
                checked={activePlayers.includes(player)}
                onChange={() => togglePlayer(player)}
              />{' '}
              {player}
              {activePlayers.includes(player) && 
                <span style={{
                  marginLeft: '0.5rem',
                  color: getInfieldInnings(player) >= 2 ? '#276749' : '#718096',
                  fontSize: '0.9rem'
                }}>
                  ({getInfieldInnings(player)} IF)
                </span>
              }
            </label>
          ))}
        </div>

        <h2>Pitchers</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1, 2, 3].map((slot) => (
            <label key={slot}>
              Slot {slot}:{' '}
              <select value={pitchers[slot]} onChange={e => handlePitcherChange(slot, e.target.value)}>
                <option value="">Select</option>
                {activePlayers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <h2>Catchers</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1, 2, 3].map((slot) => (
            <label key={slot}>
              Slot {slot}:{' '}
              <select value={catchers[slot]} onChange={e => handleCatcherChange(slot, e.target.value)}>
                <option value="">Select</option>
                {activePlayers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
        
        <button style={{marginTop: '1rem'}} onClick={autoGenerateLineup}>Auto-Generate Lineup</button>
        <button style={{marginTop: '1rem', marginLeft: '1rem'}} onClick={exportLineup}>Export Lineup</button>
      </div>

      <div className="lineup-section">
        <div className="validation-summary">
          <div className="validation-group">
            <h3>Core Requirements</h3>
            <ul className="validation-list">
              {validationResults.slice(0, 1).map((res, idx) => (
                <li key={idx}>
                  {res.errors.length === 0 ? 
                    <span style={{color: '#276749'}}>✓ Position Grid Valid</span> :
                    <span style={{color: '#c53030'}}>⚠ {res.errors.length} position issues</span>
                  }
                </li>
              ))}
            </ul>
          </div>
          
          <div className="validation-group">
            <h3>Battery</h3>
            <ul className="validation-list">
              {validationResults.slice(1, 3).map((res, idx) => (
                <li key={idx}>
                  {res.errors.length === 0 ? 
                    <span style={{color: '#276749'}}>✓ {res.step.replace(' Requirements', '')}</span> :
                    <span style={{color: '#c53030'}}>⚠ {res.errors.length} {res.step.toLowerCase()} issues</span>
                  }
                </li>
              ))}
            </ul>
          </div>

          <div className="validation-group">
            <h3>Player Rotation</h3>
            <ul className="validation-list">
              {validationResults.slice(3).map((res, idx) => (
                <li key={idx}>
                  {res.errors.length === 0 ? 
                    <span style={{color: '#276749'}}>✓ {res.step}</span> :
                    <span style={{color: '#c53030'}}>⚠ {res.errors.length} {res.step.toLowerCase()} issues</span>
                  }
                </li>
              ))}
            </ul>
          </div>
          
          {validationResults.some(res => res.errors.length > 0) && (
            <div className="validation-group" style={{flexBasis: '100%'}}>
              <h3>Issues to Fix</h3>
              <ul className="validation-list">
                {validationResults.flatMap((res, idx) => 
                  res.errors.map((err, i) => (
                    <li key={`${idx}-${i}`} style={{color: '#c53030'}}>• {err}</li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <h2>Lineup By Inning</h2>
        {innings.map((inn) => (
          <div key={inn} className="inning-block">
            <div className="inning-header">
              <h3 style={{margin: 0, color: '#2b6cb0'}}>Inning {inn}</h3>
              {(inn === 1 || inn === 2) && <span style={{marginLeft: 'auto', fontSize: '0.9rem', color: '#718096'}}>Pitcher/Catcher Slot 1</span>}
              {(inn === 3 || inn === 4) && <span style={{marginLeft: 'auto', fontSize: '0.9rem', color: '#718096'}}>Pitcher/Catcher Slot 2</span>}
              {inn === 5 && <span style={{marginLeft: 'auto', fontSize: '0.9rem', color: '#718096'}}>Pitcher/Catcher Slot 3</span>}
            </div>
            <div className="inning-grid">
              {[
                ['P', 'C', '1B'],
                ['2B', '3B', 'SS'],
                ['LF', 'CF', 'RF']
              ].map((posGroup, groupIdx) => (
                <div key={groupIdx} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  {posGroup.map((pos) => (
                    <div key={pos} className="position-row">
                      <label style={{
                        color: pos === 'P' || pos === 'C' ? '#2b6cb0' : 'inherit',
                        fontWeight: pos === 'P' || pos === 'C' ? '500' : 'normal'
                      }}>{pos}</label>
                      <select
                        value={lineup[inn][pos]}
                        onChange={e => handleInputChange(inn, pos, e.target.value)}
                        style={{
                          backgroundColor: pos === 'P' || pos === 'C' ? '#ebf8ff' : 'white'
                        }}
                      >
                        <option value="">Select</option>
                        {activePlayers.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
