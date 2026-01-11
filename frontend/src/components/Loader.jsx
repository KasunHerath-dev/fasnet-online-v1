import React from 'react';
import { Activity } from 'lucide-react';

const Loader = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="text-center">
                <Activity className="w-12 h-12 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-gray-600 font-medium">Loading...</p>
            </div>
        </div>
    );
}

export default Loader;
