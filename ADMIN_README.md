# Admin Panel - Edit Challenges

This admin panel is only accessible in development mode and allows you to manage the game challenges.

## Access

- **Development Mode**: Navigate to `/admin/edit-challenges` or click the "Admin" link in the header
- **Production**: This route is completely disabled and will not be available

## Features

### Challenge List
- View all available challenges
- Filter by level (soft, mild, hot, spicy, kinky)
- Filter by kind (truth, dare)
- Click on any challenge to select it for editing

### Challenge Editor
When you select a challenge or click "Add New", you can:

#### View/Edit Fields:
- **Level**: The difficulty level of the challenge
- **Kind**: Whether it's a truth or dare
- **Text**: The challenge text (supports placeholders like `{active_player}` and `{other_player}`)
- **Gender For**: Comma-separated list of genders that can receive this challenge (e.g., "female, male")
- **Gender Target**: Comma-separated list of genders that this challenge can be performed on (e.g., "female, male")
- **Tags**: Comma-separated list of tags for filtering (e.g., "physical, sexual, romantic")

#### Actions:
- **Delete**: Remove the selected challenge (disabled for new challenges)
- **Update**: Save changes to the selected challenge (disabled for new challenges)
- **Add**: Create a new challenge with the specified content (only enabled when adding new)

## Current Limitations

⚠️ **Important**: The Delete, Update, and Add buttons currently only show console logs and alerts. They do not actually modify the JSON file. This functionality is planned to be implemented when a database is added to the project.

## Data Format

Challenges are stored in the following format:
```json
{
  "id": "unique-uuid",
  "level": "soft|mild|hot|spicy|kinky",
  "kind": "truth|dare",
  "text": "Challenge text with {active_player} and {other_player} placeholders",
  "gender_for": ["female", "male"],
  "gender_target": ["female", "male"],
  "tags": ["tag1", "tag2"]
}
```

## Development Notes

- The admin route is conditionally rendered only when `import.meta.env.DEV` is true
- The admin link in the header is also only visible in development mode
- All functionality is designed to be easily extended when database integration is added
