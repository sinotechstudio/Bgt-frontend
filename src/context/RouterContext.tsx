import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
  searchParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [searchString, setSearchString] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.search || '';
    }
    return '';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchString(window.location.search || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (typeof window !== 'undefined') {
      const [pathOnly, searchPart] = to.split('?');
      window.history.pushState({}, '', to);
      setCurrentPath(pathOnly || '/');
      setSearchString(searchPart ? `?${searchPart}` : '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Simple route param extractor: /tournaments/:id
  const params: Record<string, string> = {};
  if (currentPath.startsWith('/tournaments/')) {
    const segments = currentPath.split('/');
    if (segments[2]) {
      params.id = segments[2];
    }
  }

  const searchParams = new URLSearchParams(searchString);

  return (
    <RouterContext.Provider value={{ path: currentPath, navigate, params, searchParams }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
