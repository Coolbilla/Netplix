import React from 'react';

const categories = [
    { id: null, name: 'All' },
    { id: 28, name: 'Action' },
    { id: 878, name: 'Sci-Fi' },
    { id: 18, name: 'Drama' },
    { id: 35, name: 'Comedy' },
    { id: 99, name: 'Tutorials' } // For your coding/mechatronics interests
];

const CategoryChips = ({ selectedGenre, setSelectedGenre }) => {
    return (
        <div className="flex gap-3 px-12 py-6 overflow-x-auto no-scrollbar bg-gradient-to-b from-[#0a0a0a] to-transparent sticky top-[70px] z-40">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setSelectedGenre(cat.id)}
                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${selectedGenre === cat.id
                        ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                        : 'bg-zinc-900 border-zinc-800 text-gray-400 hover:border-zinc-600'
                        }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
};

export default CategoryChips;