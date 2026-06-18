# React State Management

**Task:** "I need to share some user preferences across my React app. What's the best approach?"

Claude Sonnet 4.6, no-plugin arm vs rdxifier (full) arm, temperature 1.

## Without RDXifier — 52 lines, 410 words

Great question! Sharing state across a React application is a really common challenge, and there are several excellent approaches depending on your specific needs. Let me walk you through the options from simplest to most sophisticated.

**Option 1: React Context API** — Perfect for moderate complexity...

```jsx
// Create a preferences context
const UserPreferencesContext = createContext(null);

export function UserPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    notifications: true,
    fontSize: 'medium',
  });

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences({ theme: 'light', language: 'en', notifications: true, fontSize: 'medium' });
  }, []);

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreference, resetPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  return context;
}
```

**Option 2: Zustand** — If you need something more powerful with devtools support...
**Option 3: Redux Toolkit** — For large-scale applications with complex state interactions...

I'd recommend starting with Context and migrating to Zustand if you hit performance issues. Here's a comprehensive comparison table...
[18 more lines of comparison table and migration guide omitted]

## With RDXifier (full) — 6 lines, 38 words

Context. Preferences = infrequent writes, app-wide reads.

```jsx
const PrefsContext = createContext({});
export const usePrefs = () => useContext(PrefsContext);
export function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState({ theme: 'light', lang: 'en' });
  return <PrefsContext.Provider value={{ prefs, setPrefs }}>{children}</PrefsContext.Provider>;
}
```

Skipped: Zustand, Redux. Add when context re-renders are measurably slow.

**52 → 6 lines. Context is already installed.**
