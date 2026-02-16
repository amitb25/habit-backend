import { useAuth } from "../../context/AuthContext";

const Header = ({ title }) => {
  const { admin } = useAuth();

  return (
    <header className="bg-slate-900/50 border-b border-slate-700/50 px-6 py-4 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {admin?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
