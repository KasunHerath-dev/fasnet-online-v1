import React from 'react';

const PromoCard = () => {
    return (
        <div className="bg-[#2a2a2a] rounded-[32px] p-8 relative overflow-hidden flex flex-col h-full justify-between">
            <div>
                <p className="text-white/80 text-sm font-medium mb-6">
                    New course matching your interests
                </p>
                <div className="inline-block mb-4">
                    <span className="px-4 py-1.5 rounded-[10px] text-xs font-bold bg-[#fce38a] text-[#151313]">
                        Computer Science
                    </span>
                </div>

                <h2 className="text-[1.7rem] font-bold text-white leading-tight mb-8">
                    Microsoft Future Ready:<br />Fundamentals of Big Data
                </h2>

                <p className="text-white/80 text-[13px] font-medium mb-3">
                    They are already studying
                </p>

                <div className="flex items-center gap-4 mb-8">
                    <div className="flex -space-x-3 items-center">
                        <img src="https://i.pravatar.cc/150?u=31" className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] z-0" alt="Student 1" />
                        <img src="https://i.pravatar.cc/150?u=32" className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] z-10" alt="Student 2" />
                        <img src="https://i.pravatar.cc/150?u=33" className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] z-20" alt="Student 3" />
                        <div className={`w-10 h-10 rounded-full border-2 border-[#2a2a2a] z-30 bg-[#fccc42] flex items-center justify-center text-xs font-black text-[#151313]`}>
                            +100
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <button className="w-full bg-[#ff5734] hover:bg-[#ff5734]/90 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] shadow-sm">
                    More details
                </button>
            </div>
        </div>
    );
};

export default PromoCard;
