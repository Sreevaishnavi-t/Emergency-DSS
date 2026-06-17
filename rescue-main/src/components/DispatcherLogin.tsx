import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function DispatcherLogin() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple demo logic: any non-empty password works, or just click login
        if (password === "admin" || password === "") {
            navigate("/dispatcher-dashboard");
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-2xl w-full max-w-md z-10 border-t-4 border-t-blue-500"
            >
                <button 
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition mb-6 text-sm"
                >
                    <ArrowLeft size={16} /> Back to Home
                </button>

                <div className="flex justify-center mb-6">
                    <div className="bg-blue-500/20 p-4 rounded-full">
                        <Shield className="text-blue-500 w-10 h-10" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white text-center mb-2">Dispatcher Login</h2>
                <p className="text-slate-400 text-center text-sm mb-8">Enter your credentials to access the Command Center</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Access Code</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin code..."
                                className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500 transition`}
                            />
                        </div>
                        {error && <p className="text-red-500 text-[10px] mt-1 font-bold">Invalid access code. Please try again.</p>}
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-500/20"
                    >
                        Access Command Center
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Secure Access System v4.0</p>
                </div>
            </motion.div>
        </div>
    );
}
