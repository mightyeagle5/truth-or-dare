# Truth or Dare - The Sexy Version

A playful, minimalist, sex-oriented Truth or Dare game for couples and FWB. Built with Vite + React + TypeScript.

## Features

- **Two-player gameplay** with support for up to 8 players
- **Six difficulty levels**: Soft, Mild, Hot, Spicy, Kinky, and Progressive
- **Smart filtering** to avoid repeating challenges from previous games
- **Consecutive choice rules** to ensure variety in gameplay
- **Progressive mode** that advances through all levels
- **Local storage** to persist game history and progress
- **Responsive design** that works on desktop and mobile
- **Smooth animations** with Framer Motion
- **No scrolling** - everything fits on screen

## Tech Stack

- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Framer Motion** - Animations
- **React Router** - Navigation
- **date-fns** - Date formatting
- **nanoid** - ID generation
- **Vitest** - Testing framework
- **CSS Modules** - Scoped styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd truth-or-dare
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Running Tests

```bash
npm test
```

## Game Rules

### Basic Gameplay

1. **Setup**: Choose players, select difficulty level, optionally filter out previously played challenges
2. **Turns**: Players take turns choosing Truth or Dare
3. **Challenges**: Complete the selected challenge or skip it
4. **Progression**: In Progressive mode, advance through levels after 10 turns or when challenges are depleted

### Consecutive Choice Rules

- Players cannot choose the same type (Truth or Dare) more than 2 times in a row
- Completing a Wild Card resets the consecutive counter for that player
- Skipping a Wild Card does not reset the counter

### Level Progression

- **Soft**: Gentle and romantic challenges
- **Mild**: A bit more adventurous with playful teasing
- **Hot**: Steamy challenges that heat things up
- **Spicy**: Intense and daring with explicit content
- **Kinky**: The wildest challenges for experienced players
- **Progressive**: Automatically advances through all levels

## Data Structure

### Game Questions JSON

The game loads questions from `/src/data/game_questions.json`. Each question should follow this structure:

```json
{
  "id": "unique-item-id",
  "level": "Soft|Mild|Hot|Spicy|Kinky",
  "kind": "truth|dare",
  "text": "The challenge text"
}
```

### Example Data

```json
[
  {
    "id": "soft-truth-1",
    "level": "Soft",
    "kind": "truth",
    "text": "What is your biggest turn-on?"
  },
  {
    "id": "soft-dare-1",
    "level": "Soft",
    "kind": "dare",
    "text": "Give your partner a 30-second massage."
  }
]
```

## Local Storage

The app uses localStorage to persist:

- **Game History** (`tod.games`): List of all played games with metadata
- **Individual Games** (`tod.game.<id>`): Full game state including used items

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── routes/             # Page components
├── store/              # Zustand store and selectors
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # Global styles
├── data/               # Game questions JSON
└── tests/              # Test files
```

### Key Components

- **HomePage**: Game setup and player configuration
- **GamePage**: Main gameplay with Choice and Item screens
- **ChoiceScreen**: Player selects Truth or Dare
- **ItemScreen**: Displays the selected challenge
- **PlayerList**: Manage players and their genders
- **LevelSelector**: Choose difficulty level
- **PreviousGamesPicker**: Filter out previously played challenges

### State Management

The app uses Zustand for state management with:

- **Game State**: Current game, items, screen, etc.
- **Actions**: Game lifecycle, gameplay, settings
- **Selectors**: Computed values and derived state

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is for adults only and intended for personal use. Please ensure all participants are of legal age and consent to the content.

## Disclaimer

This game contains adult content and is intended for mature audiences only. All participants must be of legal age and consent to the content. Use responsibly and respect boundaries.
