'use client';

import { useEffect, useState } from 'react';

export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = () => {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.style.display = 'flex';
      setIsLoading(true);
    }
  };

  const hideLoader = () => {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      setTimeout(() => {
        spinner.style.display = 'none';
        setIsLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    // Hide loader on initial page load
    const timer = setTimeout(() => {
      hideLoader();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    isLoading,
    showLoader,
    hideLoader
  };
}
