# Coach Helper Web App - Product Requirements Document (PRD)

## Purpose
The Coach Helper Web App is designed to help Nick create, verify, and manage youth baseball lineups that strictly follow all AAA and team-specific rules. The app will automate lineup validation, reduce mistakes, and streamline the process of generating fair and legal lineups for every game.

## Target User
- Nick (youth baseball coach)
- Use case: On desktop or mobile, before and during games

## Inputs
- List of all available players for the game (select from a pre-defined roster; Nick should NOT have to type player names)
- List of players not playing (absent or sitting out; select from roster)
- Pitchers (select from roster for each slot)
- Catchers (select from roster for each slot)
- Number of innings (default: 5)

## Core Features
1. **Lineup Entry**
   - Display Nick's full roster as a selectable list
   - Nick selects which players are active for the game (checkboxes or toggles)
   - Assign pitchers and catchers for each required slot (select from roster)
   - Enter or auto-generate position assignments for each inning (using selected players)
   - Nick should never have to type player names manually

2. **Automated Validation**
   - Enforce all rules from lineup-verification.md:
     - No player appears twice in an inning
     - All 9 positions filled each inning
     - Pitcher/catcher slot rules (no overlap, correct innings)
     - Infield position count by end of inning 4 (min 2 per player)
     - No consecutive innings at same position (except pitcher/catcher)
     - No player sits consecutive innings; fair bench distribution
   - Real-time error feedback and guidance

3. **Step-by-Step Checklist**
   - UI guides Nick through each validation step
   - Cannot proceed if a step fails
   - Visual checkboxes and error messages

4. **Lineup Output**
   - Display lineup in grid format (by inning/position)
   - Option to export or print lineup card

## Optional/Nice-to-Have Features
- Save/load lineups for future games
- Mobile-optimized interface
- Export to PDF or image
- Share lineup via email or text

## Success Criteria
- Nick can enter all required info and generate a valid lineup with no manual cross-checking
- The app prevents submission of invalid lineups
- All rules from lineup-verification.md are enforced automatically
- The UI is simple, clear, and usable on both desktop and mobile

## TODO
- Add batting order helper
- Fix so errors don't show unless a lineup has been generated
- Deploy it, (pages works but needs to be public, maybe move to a new repo, or deploy to azure)

## References
- [lineup-verification.md](./lineup-verification.md)
- [team-info.md](./team-info.md)
- [aaa-rules-summary.md](./aaa-rules-summary.md)

---
_Nick, let me know if you want to add or change any requirements !_
