export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef8f5]">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
    </div>
  );
}
