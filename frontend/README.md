# AI Spreadsheet Editor - Frontend

A modern, AI-powered spreadsheet application built with Next.js, TypeScript, and ShadCn UI components.

## 🚀 Features

- **Interactive Spreadsheet**: Click to select cells, double-click to edit values
- **AI-Powered Formulas**: Write natural language formulas that get calculated by AI
- **Real-time Updates**: See changes instantly across the spreadsheet
- **Responsive Design**: Works on desktop and tablet devices
- **Type Safety**: Full TypeScript support for robust development

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with ShadCn UI components
- **Icons**: Lucide React
- **State Management**: React hooks (useState)

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and dark theme
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main application page
├── components/
│   ├── ui/                  # ShadCn UI components
│   ├── Cell.tsx            # Individual cell component
│   ├── SpreadsheetArea.tsx # Main spreadsheet area
│   ├── SpreadsheetTable.tsx # Table component
│   └── AiSidebar.tsx       # AI formula sidebar
├── types/
│   └── spreadsheet.ts      # TypeScript type definitions
└── utils/
    └── spreadsheet.ts      # Utility functions
```

## 🎨 UI Components

### Cell Component
- **Single Click**: Selects the cell (blue highlight)
- **Double Click**: Enables edit mode with input field
- **Formula Indicator**: Shows sparkles icon if cell has an AI formula
- **Value Processing**: Automatically converts strings to appropriate types

### SpreadsheetTable
- Renders the main data grid using ShadCn Table components
- Scrollable interface for large datasets
- Responsive column widths

### SpreadsheetArea
- Contains "Add/Remove Row" and "Add/Remove Column" buttons with skeuomorphic styling
- Manages the overall spreadsheet layout

### AiSidebar
- **Formula Editor**: Textarea for writing natural language formulas
- **Cell Information**: Shows selected cell position and details
- **Run Button**: Executes AI calculations via backend API
- **Error Handling**: Displays calculation errors with user-friendly messages
- **Loading States**: Shows progress during API calls

## 🔧 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 📊 Data Structure

The application uses the following TypeScript interfaces:

```typescript
interface ColumnDef {
  id: string;
  label: string;
  width?: number;
}

interface Row {
  id: string;
  [key: string]: string | number | boolean | null;
}

interface SelectedCell {
  rowId: string;
  colId: string;
}
```

## 🔌 API Integration

The frontend communicates with the backend via:

- **Endpoint**: `POST /api/calculate`
- **Payload**: Formula text, target cell, columns, and data
- **Response**: Calculated result or error message

## 🎯 Key Features Implemented

### State Management
- Centralized state using React hooks
- Immutable updates for data integrity
- Proper TypeScript typing throughout

### User Interactions
- Cell selection with visual feedback
- Inline editing with Enter/Escape key support
- Dynamic row/column addition

### AI Formula System
- Natural language formula input
- Real-time formula storage
- Visual indicators for cells with formulas
- Error handling and user feedback

### Styling & UX
- Dark theme with gradient backgrounds
- Skeuomorphic button styling
- Smooth animations and transitions
- Custom scrollbars
- Responsive grid layout

## 🔍 Development Notes

### Custom CSS Classes
- `.skeuomorphic-btn`: 3D button styling with gradients and shadows
- `.cell-input`: Transparent input styling for inline editing

### Key Design Decisions
- Used CSS Grid for main layout (3fr_1fr split)
- Implemented controlled components throughout
- Separated concerns with dedicated components for each feature
- Used proper semantic HTML with ARIA considerations

## 🚀 Future Enhancements

- [ ] Mobile responsiveness improvements
- [ ] Keyboard navigation (arrow keys)
- [ ] Copy/paste functionality
- [ ] Cell formatting options
- [ ] Export/import capabilities
- [ ] Collaborative editing
- [ ] Undo/redo functionality

---

This frontend provides a solid foundation for an AI-powered spreadsheet application with modern web technologies and best practices.
