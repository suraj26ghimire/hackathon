import React, { useEffect } from 'react';

const AdminRedirect = () => {
  useEffect(() => {
    // Adjust host and port if backend runs on a different port.
    const host = window.location.hostname;
    const port = '8000'; // Django dev server port
    const adminUrl = `http://${host}:${port}/admin/`;
    window.location.replace(adminUrl);
  }, []);
  return <div className="flex h-screen items-center justify-center">Redirecting to admin...</div>;
};

export default AdminRedirect;
