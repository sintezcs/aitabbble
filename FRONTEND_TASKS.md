# Frontend Implementation Tasks

This document outlines the steps to build the spreadsheet UI using Next.js and ShadCn. The architecture is based on a main content area for the table and a sidebar for managing AI formulas.

## 1. Project Setup

-   **Task:** Initialize a new Next.js project and add necessary dependencies.
-   **Directory:** Create a `frontend` directory.
-   **Commands:**
    1.  `npx create-next-app@latest frontend --typescript --tailwind --eslint`
    2.  `npx shadcn-ui@latest init` (Choose `Default` for base color, `Dark` for theme).
    3.  `npm install lucide-react` (for icons).

## 2. Global Styles and Main Layout

-   **Task:** Define the global styles and create the main two-column page layout (spreadsheet and sidebar).
-   **File:** `frontend/src/app/globals.css`
-   **Details:**
    -   Set the body background to a dark color (e.g., `#111827`).
    -   Add a subtle glowing gradient effect for visual appeal using pseudo-elements on a layout container.
-   **File:** `frontend/src/app/page.tsx`
-   **Details:**
    -   Use CSS Grid or Flexbox to create a two-column layout. The left column (main area) will take up most of the space, and the right column will be the sidebar.
    -   Example Layout: `<div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] h-screen">`

## 3. State Management

-   **Task:** Set up the application's state using React hooks.
-   **File:** `frontend/src/app/page.tsx`
-   **Details:**
    -   Define the primary state variables using `useState`:
        -   `columns`: `useState<ColumnDef[]>(initialColumns)`
        -   `data`: `useState<Row[]>(initialData)`
        -   `aiFormulas`: `useState<Record<string, string>>({})` (e.g., `{ 'row1-col2': 'formula text' }`)
        -   `selectedCell`: `useState<{ rowId: string; colId: string } | null>(null)`

## 4. Main Component: `SpreadsheetArea`

-   **Task:** Create a component to house the action buttons and the spreadsheet table itself.
-   **Component:** `frontend/src/components/SpreadsheetArea.tsx`
-   **Details:**
    -   This component will receive the `columns`, `data`, `selectedCell`, and their setter functions as props.
    -   It will contain the "Add Row" and "Add Column" buttons. Use the ShadCn `<Button>` component and style it with a skeuomorphic look (gradients, borders, shadows).
    -   It will render the `SpreadsheetTable` component below the buttons.

## 5. Core Component: `SpreadsheetTable`

-   **Task:** Build the main table to display the data grid.
-   **Component:** `frontend/src/components/SpreadsheetTable.tsx`
-   **ShadCn Components:** Use `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, and `<TableCell>`.
-   **Logic:**
    -   Render headers by mapping over the `columns` state.
    -   Render rows by mapping over the `data` state.
    -   Inside the body map, render a custom `Cell` component for each cell, passing all necessary props.

## 6. Core Component: `Cell`

-   **Task:** Create the interactive cell component with visual cues.
-   **Component:** `frontend/src/components/Cell.tsx`
-   **Logic:**
    -   **Display:** Show the cell's value.
    -   **Formula Indicator:** Check if a formula exists for this cell in the `aiFormulas` state. If `true`, render a "magic sparks" icon (e.g., `<Sparkles />` from `lucide-react`) inside the cell.
    -   **Click Handler:** On single click, update the global `selectedCell` state with this cell's `rowId` and `colId`.
    -   **Selection Style:** Apply a distinct border (e.g., `border-blue-500`) if this cell's ID matches the `selectedCell` state.
    -   **Double Click Handler:** On double click, make the cell's text editable by swapping a `<div>` with an `<input>` element. On blur or Enter, update the main `data` state.

## 7. Sidebar Component: `AiSidebar`

-   **Task:** Build the sidebar for viewing, editing, and running AI formulas.
-   **Component:** `frontend/src/components/AiSidebar.tsx`
-   **Props:** This component needs access to `selectedCell`, `aiFormulas`, `columns`, `data`, and the state setters.
-   **Logic:**
    -   If `selectedCell` is `null`, display a message like "Select a cell to view its AI formula."
    -   If a cell is selected, display a heading like `Formula for Cell (R${rowIndex}, C${colIndex})`.
    -   **Formula Input:** Use a `<Textarea>` from ShadCn. Its value should be bound to the formula for the selected cell (`aiFormulas[selectedCellId]`). The `onChange` handler should update the `aiFormulas` state.
    -   **Run Button:**
        -   Display a skeuomorphic `<Button>` labeled "Run AI Formula".
        -   This button should only be visible/enabled if `aiFormulas[selectedCellId]` has content.
        -   On click, initiate the API call. Create a payload containing the `formula`, `target_cell`, `columns`, and `data`.
        -   Send a `POST` request to the `/api/calculate` backend endpoint.
        -   While waiting, set a loading state (e.g., disable the button and show a spinner).
        -   Upon successful response, update the `data` state for the target cell with the result from the backend.
        -   Implement error handling using a toast or alert if the API call fails.
