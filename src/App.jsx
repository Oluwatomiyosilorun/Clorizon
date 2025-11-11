import React, { useState, useCallback, useMemo, Suspense } from "react";
import "./index.css";

import NotesWidget from "./widgets/Notes/index.jsx";
import AiChatWidget from "./widgets/Chat/index.jsx";
import AnalyticsSummaryWidget from "./widgets/Analytics/index.jsx";

// Fake delay to simulate network loading
const simulateDelay = (Component) =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ default: Component }), 700);
  });

const LazyNotes = React.lazy(() => simulateDelay(NotesWidget));
const LazyChat = React.lazy(() => simulateDelay(AiChatWidget));
const LazyAnalytics = React.lazy(() => simulateDelay(AnalyticsSummaryWidget));

const WIDGET_MAP = {
  notes: { component: LazyNotes, layout: "col-span-1 row-span-2" },
  analytics: { component: LazyAnalytics, layout: "col-span-2 row-span-1" },
  chat: { component: LazyChat, layout: "col-span-2 row-span-1" },
};

const INITIAL_NOTES = [
  { id: 1, content: "Review project timeline" },
  { id: 2, content: "Prepare weekly report" },
  { id: 3, content: "Plan dashboard upgrade" },
];

export default function App() {
  // Central State for Inter-Widget Communication and Data
  const [dashboardState, setDashboardState] = useState({
    selectedNoteId: null,
    analyticsRefreshCount: 0,
    widgets: ['notes', 'analytics', 'chat'],
    notes: INITIAL_NOTES, // Central data store for Notes
  });

  // Central Dispatcher (handles all state changes from widgets)
  const handleAction = useCallback((action) => {
    setDashboardState(prevState => {
      switch (action.type) {
        // Broadcast Event: Analytics signals a refresh to the Chat Widget
        case 'REFRESH_ANALYTICS':
          return { ...prevState, analyticsRefreshCount: prevState.analyticsRefreshCount + 1 };
        
        // Target Event: Notes Widget toggles note selection state
        case 'NOTE_SELECTED':
          const newId = prevState.selectedNoteId === action.payload ? null : action.payload;
          return { ...prevState, selectedNoteId: newId };

        // Data Management (CRUD operations on Notes data)
        case 'ADD_NOTE':
          const newNoteId = prevState.notes.length > 0 ? Math.max(...prevState.notes.map(n => n.id)) + 1 : 1;
          return {
            ...prevState,
            notes: [...prevState.notes, { id: newNoteId, content: action.payload }]
          };
        case 'DELETE_NOTE':
          const filteredNotes = prevState.notes.filter(n => n.id !== action.payload);
          return {
            ...prevState,
            notes: filteredNotes,
            selectedNoteId: prevState.selectedNoteId === action.payload ? null : prevState.selectedNoteId
          };
        case 'EDIT_NOTE':
          const updatedNotes = prevState.notes.map(n =>
            n.id === action.payload.id ? { ...n, content: action.payload.content } : n
          );
          return { ...prevState, notes: updatedNotes };

        default:
          return prevState;
      }
    });
  }, []);

  // Props to pass to the widgets, derived from central state
  const widgetProps = useMemo(() => ({
    notes: { 
      notes: dashboardState.notes, 
      dispatch: handleAction 
    },
    chat: { 
      selectedNoteId: dashboardState.selectedNoteId, 
      refreshCount: dashboardState.analyticsRefreshCount, 
      notes: dashboardState.notes,
      dispatch: handleAction,
    },
    analytics: { 
      dispatch: handleAction 
    },
  }), [dashboardState, handleAction]);


  const WidgetRenderer = ({ widgetId }) => {
    const WidgetEntry = WIDGET_MAP[widgetId];
    if (!WidgetEntry) return null;

    const LazyComponent = WidgetEntry.component;
    const props = widgetProps[widgetId];

    return (
      <div className={`${WidgetEntry.layout} h-full min-h-0`}> 
        <Suspense fallback={
          <div className="flex justify-center items-center h-full bg-gray-200 rounded-xl shadow-lg border-2 border-indigo-300 animate-pulse">
            <div className="text-indigo-600 font-semibold text-lg flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading {widgetId.toUpperCase()} Widget...
            </div>
          </div>
        }>
          <LazyComponent {...props} />
        </Suspense>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans flex flex-col">
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Test Dashboard
        </h1>
        <p className="text-gray-500">A structured, user-focused layout optimized for clarity and ease of use.</p>
      </header>

      {/* Main Grid Layout (Tailwind CSS for responsive layout) */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
        {dashboardState.widgets.map((id) => (
          <WidgetRenderer key={id} widgetId={id} />
        ))}
      </div>

      <footer className="mt-8 pt-4 border-t border-gray-200 text-center flex-shrink-0">
        <p className="text-sm text-gray-500">
          Analytics Refreshed: <span className="font-mono text-xs p-1 bg-gray-200 rounded">{dashboardState.analyticsRefreshCount} times</span>
        </p>
      </footer>
    </div>
  );
};

