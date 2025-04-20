import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const PurposeFrame = ({ onPurposeUpdate }) => {
    const userData = useSelector(state => state.user.userData);
    const [selectedItem, setSelectedItem] = useState([]);
    
    const handlePurposeChange = async (purpose) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/profile/purpose`, {
                userId: userData._id,
                purpose: purpose
            });
            
            if (response.status === 200) {
                if (selectedItem.includes(purpose)) {
                    setSelectedItem(selectedItem.filter(item => item !== purpose));
                } else {
                    setSelectedItem([...selectedItem, purpose]);
                }
                onPurposeUpdate(purpose);
            }
        } catch (error) {
            console.error('Ошибка при изменении purpose:', error);
        }
    };

    const items = [
        {
            id: 1,
            name: 'Restaurant',
            icon: '/icons/purposes/restaurant.svg'
        },
        {
            id: 2,
            name: 'Just for fun',
            icon: '/icons/purposes/just-for-fun.svg'
        },
        {
            id: 3,
            name: 'Long-term',
            icon: '/icons/purposes/long-term.svg'
        },
        {
            id: 4,
            name: 'Online fun only',
            icon: '/icons/purposes/online-fun-only.svg'
        },
        {
            id: 5,
            name: 'Open to swaps',
            icon: '/icons/purposes/open-to-swaps.svg'
        },
        {
            id: 6,
            name: 'BDSM',
            icon: '/icons/purposes/bdsm.svg'
        },
        {
            id: 7,
            name: 'Roleplay',
            icon: '/icons/purposes/roleplay.svg'
        },
        {
            id: 8,
            name: 'Club',
            icon: '/icons/purposes/club.svg'
        },
        {
            id: 9,
            name: 'Netflix & More',
            icon: '/icons/purposes/netflix-and-more.svg'
        },
        {
            id: 10,
            name: 'Extreme',
            icon: '/icons/purposes/extreme.svg'
        },
    ]

    return (
        <div>
            <img 
                src="/icons/profile/purposes-frame.svg" 
                alt="purpose" 
                className="absolute z-[5] top-[290px] left-[40px] w-[300px] h-[140px]" 
            />
            <div className="absolute z-[6] top-[300px] left-[50px] w-[280px] flex flex-wrap gap-2">
                {items.map((item) => (
                    <div 
                        key={item.id} 
                        className={`
                            flex items-center gap-0.7 px-1 py-1.5 rounded-full
                            bg-gradient-to-r from-[#FF63BB] to-[#9C4DFF]
                            cursor-pointer text-white text-sm h-[26px]
                        `}
                        onClick={() => handlePurposeChange(item.name)}
                    >
                        <img src={item.icon} alt={item.name} className="w-[10px] h-[10px]" />
                        <span className="whitespace-nowrap text-[10px]">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PurposeFrame; 