import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#f0fdf9' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
