import React, { useState } from "react";

export default function NotesWidget ({ dispatch, notes }) {
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const handleSelectNote = (noteId) => {
    dispatch({ type: 'NOTE_SELECTED', payload: noteId });
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      dispatch({ type: 'ADD_NOTE', payload: newNote.trim() });
      setNewNote('');
    }
  };

  const handleDeleteNote = (noteId) => {
    dispatch({ type: 'DELETE_NOTE', payload: noteId });
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditingContent(note.content);
  };
  
  const saveEdit = (noteId) => {
    if (!editingContent.trim()) return;
    dispatch({ type: 'EDIT_NOTE', payload: { id: noteId, content: editingContent.trim() } });
    setEditingId(null);
    setEditingContent('');
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-xl h-full flex flex-col border border-indigo-200 min-h-0">
      <h3 className="text-xl font-bold mb-3 text-indigo-700 flex-shrink-0">Notes ({notes.length})</h3>
      
      <div className="h-0 flex-grow overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50 min-h-0">
        <ul className="space-y-2">
          {notes.map(note => (
            <li
              key={note.id}
              className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm flex justify-between items-start"
            >
              {editingId === note.id ? (
                <div className="flex-grow mr-2">
                  <textarea
                    className="w-full p-1 border border-indigo-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-900 text-opacity-100"
                    rows="2"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <button
                    className="text-xs text-white bg-indigo-500 hover:bg-indigo-600 rounded-md px-2 py-0.5 mt-1 transition"
                    onClick={() => saveEdit(note.id)}
                  >
                    Save
                  </button>
                  <button
                    className="text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md px-2 py-0.5 mt-1 ml-2 transition"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span 
                    className="cursor-pointer flex-grow hover:text-indigo-800 transition text-gray-900"
                    title="Click to select as AI context"
                    onClick={() => handleSelectNote(note.id)} 
                  >
                    {note.content}
                  </span>
                  <div className="flex space-x-2 ml-4 flex-shrink-0">
                    <button
                      className="text-gray-500 hover:text-indigo-600 transition"
                      title="Edit Note"
                      onClick={() => startEdit(note)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-1.5a2.5 2.5 0 01-3.536 3.536L6.5 20.5 4 23l2.5-2.5 9.07-9.07a2.5 2.5 0 013.536-3.536z" />
                      </svg>
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 transition"
                      title="Delete Note"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.86 12.14A2 2 0 0116.13 21H7.87a2 2 0 01-1.97-1.86L5 7m4 0V5a2 2 0 012-2h2a2 2 0 012 2v2M8 10h8m-4 4v4" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex-shrink-0">
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-900 text-opacity-100"
          rows="1"
          placeholder="Add a new note (Press Enter to save)..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddNote())}
        ></textarea>
        <button
          className="w-full mt-2 bg-indigo-600 text-white py-1.5 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          onClick={handleAddNote}
          disabled={!newNote.trim()}
        >
          Add New Note
        </button>
      </div>
    </div>
  );
};
