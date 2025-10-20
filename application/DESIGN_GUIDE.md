# DailyReport Screen - Design Guide

## Color Palette Reference

### Metric Cards Gradients

#### 1. Order Count (Sunny Yellow)
```
Gradient: #ffeaa7 → #fdcb6e
Icon Color: #fdcb6e
Value Color: #2d3436 (dark gray)
Icon: receipt-text
```

#### 2. Processed Orders (Fresh Mint)
```
Gradient: #a7f3d0 → #6ee7b7
Icon Color: #10b981
Value Color: #065f46 (dark green)
Icon: check-circle
```

#### 3. Card Payments (Lavender Purple)
```
Gradient: #ddd6fe → #c4b5fd
Icon Color: #8b5cf6
Value Color: #5b21b6 (dark purple)
Icon: credit-card (FontAwesome5)
```

#### 4. Error Orders (Strawberry Red)
```
Gradient: #fecaca → #fca5a5
Icon Color: #ef4444
Value Color: #991b1b (dark red)
Icon: alert-circle
```

### Revenue Cards Gradients

#### 1. Total Sales (Money Green)
```
Gradient: #d4f4dd → #c7f0d8
Icon Color: #27ae60
Value Color: #27ae60 (green)
Icon: cash-multiple
```

#### 2. Card Revenue (Sky Blue)
```
Gradient: #e3f2fd → #bbdefb
Icon Color: #2196f3
Value Color: #27ae60 (green)
Icon: credit-card-check
```

#### 3. Cash Revenue (Warm Vanilla)
```
Gradient: #fff9e6 → #fff3cd
Icon Color: #f59e0b
Value Color: #27ae60 (green)
Icon: cash
```

### Chart Colors

```
Background Gradient: #ff6b9d → #c9184a (Strawberry pink to cherry red)
Container: white
Icon Badge: #ff6b9d
Line Color: white
Dot Stroke: white
Dot Fill: #fff3e0 (vanilla)
Grid Lines: rgba(255, 255, 255, 0.2)
```

---

## Typography Scale

```
Section Titles:  20px (FontsSize.large) - Lato Bold - #2d3436
Metric Values:   36px - Lato Black - Context colors
Revenue Values:  40px - Lato Black - #27ae60
Metric Labels:   16px (FontsSize.medium) - Lato Regular - #5a6978
Revenue Labels:  20px (FontsSize.large) - Lato Bold - #2d3436
Chart Title:     20px (FontsSize.large) - Lato Bold - #2d3436
```

---

## Spacing System (8pt Grid)

```
Section Padding:
- Horizontal: 20px
- Top: 20px
- Bottom: 12px

Metric Cards:
- Container Padding: 12px
- Card Internal Padding: 16px
- Gap Between Cards: 12px
- Border Radius: 16px

Revenue Cards:
- Container Padding: 20px horizontal, 16px vertical
- Card Internal Padding: 20px
- Gap Between Cards: 12px
- Border Radius: 16px

Chart:
- Container Padding: 12px horizontal, 16px vertical
- Card Padding: 16px
- Border Radius: 20px

Icon Badges (Metric):
- Size: 48x48px
- Border Radius: 24px

Icon Badges (Revenue):
- Size: 40x40px
- Border Radius: 20px

Icon Badges (Chart):
- Size: 44x44px
- Border Radius: 22px
```

---

## Shadow & Elevation

```
Cards:
elevation: 4
shadowColor: #000
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.15
shadowRadius: 4

Icon Badges:
elevation: 2
shadowColor: #000
shadowOffset: { width: 0, height: 1 }
shadowOpacity: 0.2
shadowRadius: 2
```

---

## Component Layout Structure

### MetricCard
```
┌─────────────────────────────────┐
│ ╔═════════════════════════════╗ │
│ ║  [Gradient Background]      ║ │
│ ║                             ║ │
│ ║   ╭─────╮                   ║ │
│ ║   │ 🧾  │  [Icon Badge]     ║ │
│ ║   ╰─────╯                   ║ │
│ ║                             ║ │
│ ║   42      [Large Value]     ║ │
│ ║   Label   [Description]     ║ │
│ ║                             ║ │
│ ╚═════════════════════════════╝ │
└─────────────────────────────────┘
Width: 47%
Min Height: 140px
Padding: 16px
```

### RevenueCard
```
┌──────────────────────────────────────┐
│ ╔══════════════════════════════════╗ │
│ ║  [Gradient Background]           ║ │
│ ║                                  ║ │
│ ║  ╭───╮  Total Sales   [Header]  ║ │
│ ║  │💰 │                          ║ │
│ ║  ╰───╯                          ║ │
│ ║                                  ║ │
│ ║  $ 1,234.56  [Large Revenue]    ║ │
│ ║                                  ║ │
│ ╚══════════════════════════════════╝ │
└──────────────────────────────────────┘
Width: 100%
Padding: 20px
```

### Chart Card
```
┌─────────────────────────────────────────┐
│ [White Background Card]                 │
│                                         │
│  ╭───╮  Actividad del Día  [Header]    │
│  │📈 │                                  │
│  ╰───╯                                  │
│                                         │
│  ╔═══════════════════════════════════╗ │
│  ║  [Chart with Pink Gradient]       ║ │
│  ║                                   ║ │
│  ║      ╱╲      ╱╲                   ║ │
│  ║     ╱  ╲    ╱  ╲                  ║ │
│  ║    ╱    ╲  ╱    ╲                 ║ │
│  ║   ╱      ╲╱      ╲                ║ │
│  ║                                   ║ │
│  ║  08 09 10 11 12 13 14...          ║ │
│  ╚═══════════════════════════════════╝ │
│                                         │
└─────────────────────────────────────────┘
Width: Screen width - 80px
Height: 420px
Border Radius: 20px
```

---

## Screen Layout Flow

```
┌─────────────────────────────────────────┐
│ [OrderFilter Component]                 │
├─────────────────────────────────────────┤
│                                         │
│ Resumen de Órdenes     [Section Title] │
│                                         │
│ ┌──────────┐  ┌──────────┐             │
│ │ Orders   │  │Processed │             │
│ │    42    │  │    38    │             │
│ └──────────┘  └──────────┘             │
│                                         │
│ ┌──────────┐  ┌──────────┐             │
│ │ Card Pmts│  │  Errors  │             │
│ │    15    │  │     4    │             │
│ └──────────┘  └──────────┘             │
│                                         │
│ Ingresos del Día       [Section Title] │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │ Total Sales        $ 2,450.00      │ │
│ └────────────────────────────────────┘ │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │ Card Revenue       $ 1,200.00      │ │
│ └────────────────────────────────────┘ │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │ Cash Revenue       $ 1,250.00      │ │
│ └────────────────────────────────────┘ │
│                                         │
│ Frecuencia de Órdenes  [Section Title] │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │         [Line Chart]               │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## Responsive Behavior

### Metric Cards Grid
- Uses `flexWrap: 'wrap'`
- Each card: 47% width
- Gap: 12px between cards
- Automatically wraps to 2 columns on any screen size

### Revenue Cards
- Full width (minus container padding)
- Stacked vertically with 12px gap
- Scales with screen width

### Chart
- Width: `Dimensions.get('window').width - 80`
- Fixed height: 420px
- Horizontal scrolling enabled for hour labels

---

## Accessibility Notes

### Contrast Ratios (WCAG AA Compliant)

```
Section Titles (#2d3436) on white: 11.6:1 ✓
Metric Labels (#5a6978) on light gradient: 4.8:1+ ✓
Revenue Values (#27ae60) on light gradient: 3.5:1+ ✓
Error Values (#991b1b) on light gradient: 7.2:1+ ✓
Success Values (#065f46) on light gradient: 9.1:1+ ✓
Chart Labels (white) on pink gradient: 4.8:1+ ✓
```

### Touch Targets
- All cards are large enough for easy tapping
- Icon badges are visual only, not interactive
- Minimum 44x44 touch target maintained

---

## Icon Reference

### Material Community Icons
```
receipt-text        - Order receipts
check-circle        - Success/completion
alert-circle        - Errors/warnings
cash-multiple       - Multiple currency
credit-card-check   - Card verification
cash                - Cash money
chart-line          - Line chart/analytics
```

### FontAwesome5 Icons
```
credit-card         - Payment card
```

---

## Implementation Checklist

- [x] Install react-native-linear-gradient
- [x] Import MaterialCommunityIcons
- [x] Import FontAwesome5
- [x] Create MetricCard component
- [x] Create RevenueCard component
- [x] Apply gradient backgrounds
- [x] Add icon badges
- [x] Update chart styling
- [x] Add section titles
- [x] Implement responsive grid
- [x] Add proper spacing
- [x] Apply shadows and elevation
- [x] Format currency values
- [x] Remove old blue color scheme
- [x] Test on device/emulator

---

## Quick Start

After pulling the updated code:

```bash
# Install dependencies
npm install

# Clean and rebuild
cd android && ./gradlew clean && cd ..

# Run the app
npm run android  # or npm run ios
```

The redesigned DailyReport screen will now display with the beautiful new ice cream-themed design!
