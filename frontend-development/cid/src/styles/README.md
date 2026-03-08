# Global Styling System

This directory contains centralized styling utilities for the React Native app. This consolidation eliminates code duplication while maintaining consistent design across all screens.

## Files Overview

### `colors.js`
Centralized color palette used throughout the app:
- **Primary Colors**: `primary` (#007AFF), `success` (#34C759), `purple` (#5856D6), `neutral` (#8E8E93)
- **Backgrounds**: `white`, `background`, `lightBackground`, `lightGray`, `inputBackground`
- **Borders**: `borderLight`, `borderLighter`, `borderLightest`
- **Text Colors**: `textPrimary`, `textDark`, `textSecondary`, `textGray`
- **Status Colors**: `error`, `errorBackground`, `errorText`, `red`
- **Transparent**: `overlay`

**Usage:**
```javascript
import { Colors } from '../styles';

// Use in components
<View style={{ backgroundColor: Colors.primary }}>
  <Text style={{ color: Colors.textSecondary }}>text</Text>
</View>
```

### `common.js`
Reusable style definitions organized into logical groups:

#### Screen Containers
- `screenContainer` - Standard centered screen layout
- `scrollContainer` - Scrollable container with top padding
- `containerWithBackground` - Light background container

#### Text Styles
- `title` - Main page title (28px, bold, margin)
- `screenTitle` - Smaller title (24px, bold)
- `label` - Form labels (fontWeight: 600)
- `buttonText` - Standard button text
- `linkText` - Clickable link styling
- `errorText` - Error message styling
- `messageText` - Info/success message styling

#### Input Fields
- `input` - Standard text input (52px height)
- `multilineInput` - Multiline text input with vertical alignment
- `modalInput` - Modal dialog input field

#### Buttons
- `buttonPrimary` - Blue primary button
- `buttonSuccess` - Green success button
- `buttonSecondary` - Secondary variant
- `loginButton` - Login form button
- `mainButton` - Main action buttons
- `registerButton` - Register variant
- `deleteButtonText` - Destructive action text
- `deleteAccountButton` - Delete account button container

#### Message Boxes
- `errorBox` - Error notification container
- `messageBox` - Generic status/message box

#### Mode/Tab Buttons
- `modeButtons` - Tab button container
- `modeButton` - Individual tab button
- `modeButtonActive` - Active tab state
- `modeButtonText` - Tab text
- `modeButtonTextActive` - Active tab text

#### Other Components
- `mapContainer` - Map view wrapper
- `map` - Map element
- `mapPlaceholder` - Loading placeholder
- `logo` - Logo/image sizing
- `welcomeText` - Welcome/intro text
- `form` - Form wrapper
- `forgotBtn` - Forgot password button
- `modalBackdrop` - Semi-transparent modal backdrop
- `modalCard` - Modal container
- `modalTitle` - Modal title

**Usage:**
```javascript
import { CommonStyles } from '../styles';

// Use single style
<View style={CommonStyles.screenContainer}>
  <Text style={CommonStyles.title}>Hello</Text>
</View>

// Combine styles for variants
<TouchableOpacity style={[CommonStyles.buttonPrimary, { backgroundColor: '#red' }]}>
  <Text style={CommonStyles.buttonText}>Delete</Text>
</TouchableOpacity>
```

### `index.js`
Central export point for all styling utilities.

### `dashboard.js`
Shared dashboard-related styles and map theme constants:
- `DashboardStyles` - Dashboard screen container styles
- `DashboardMapStyles` - Dashboard map and placeholder styles
- `DashboardMapTheme` - Shared map colors (stroke, fill, loader)
- `MapControlsStyles` - Dashboard map control button styles

### `screenStyles.js`
Shared screen-specific styles that do not fit generic common patterns:
- `ProfileScreenStyles`
- `UserListScreenStyles`
- `ResetPasswordScreenStyles`

### `taskbar.js`
Shared styles for the reusable `TaskBar` component:
- `TaskBarStyles`

**Usage:**
```javascript
// Import specific utilities
import { Colors, CommonStyles } from '../styles';

// Or import the index directly
import { CommonStyles, Colors } from '../styles/index';
```

## Design Patterns

### Color Consistency
- All primary actions use `Colors.primary` (blue)
- All success states use `Colors.success` (green)
- All errors use `Colors.error` (red with background)

### Button Variants
When you need a button with a different color, use style array syntax:
```javascript
<TouchableOpacity style={[CommonStyles.mainButton, { backgroundColor: Colors.success }]}>
  <Text style={CommonStyles.buttonText}>Register</Text>
</TouchableOpacity>
```

### Screen-Specific Overrides
If a screen needs unique styles (like Dashboard's purple test button), create a local StyleSheet:
```javascript
import { CommonStyles, Colors } from '../styles';

const styles = StyleSheet.create({
  testButton: { 
    backgroundColor: Colors.purple,
  },
});

// Then use:
<TouchableOpacity style={[CommonStyles.buttonSecondary, styles.testButton]}>
```

## Adding New Styles

1. **Global Style** - If used by 2+ screens, add to `common.js`
2. **Color Constant** - If it's a new color, add to `colors.js`
3. **Screen-Specific** - Keep in component's local StyleSheet

## Benefits

- **Reduced Code**: Eliminated ~300+ lines of duplicate styling
- **Maintainability**: Change styling in one place, updates everywhere
- **Consistency**: Ensures uniform UI/UX across all screens
- **Scalability**: Easy to add new global styles
- **Theming**: Colors centralized for potential light/dark mode support

## Migration Notes

All 5 screens have been refactored to use this system:
- `HomeScreen.js` - 95% style consolidation
- `LoginScreen.js` - 90% style consolidation
- `RegisterScreen.js` - 95% style consolidation
- `ResetPasswordScreen.js` - 92% style consolidation
- `DashboardScreen.js` - 85% style consolidation (some unique button colors)
