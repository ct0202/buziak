import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import PurposeFrame from '../../components/PurposeFrame';
import { useTranslation } from "react-i18next";

const purposeIcons = {
    'Restaurant': '/icons/purposes/restaurant.svg',
    'Just for fun': '/icons/purposes/just-for-fun.svg',
    'Long-term': '/icons/purposes/long-term.svg',
    'Online fun only': '/icons/purposes/online-fun-only.svg',
    'Open to swaps': '/icons/purposes/open-to-swaps.svg',
    'BDSM': '/icons/purposes/bdsm.svg',
    'Roleplay': '/icons/purposes/roleplay.svg',
    'Club': '/icons/purposes/club.svg',
    'Netflix & More': '/icons/purposes/netflix-and-more.svg',
    'Extreme': '/icons/purposes/extreme.svg'
};

function Profile() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userData = useSelector(state => state.user.userData);
    const [fullUserData, setFullUserData] = useState(null);
    const [aboutMeText, setAboutMeText] = useState('');
    const [isEditingPurpose, setIsEditingPurpose] = useState(false);
    const [purpose, setPurpose] = useState('');

    useEffect(() => {
        if (fullUserData?.aboutMe) {
            setAboutMeText(fullUserData.aboutMe);
        }
        if (fullUserData?.purpose) {
            setPurpose(fullUserData.purpose);
        }
    }, [fullUserData]); 

    const toggleEditingPurpose = () => {
        setIsEditingPurpose(!isEditingPurpose);
    }

    const handleAboutMeSave = async () => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/profile/about-me`, {
                userId: userData._id,
                aboutMe: aboutMeText
            });
            
            if (response.status === 200) {
                setFullUserData(prev => ({
                    ...prev,
                    aboutMe: aboutMeText
                }));
            }
        } catch (error) {
            console.error('Ошибка при сохранении описания:', error);
        }
    };

    const handlePurposeUpdate = (newPurpose) => {
        setFullUserData(prev => ({
            ...prev,
            purpose: newPurpose
        }));
        setPurpose(newPurpose);
        setIsEditingPurpose(false);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userData) {
                navigate('/signin');
            } else {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/profile?userId=${userData._id}`);
                    console.log(response.data);
                    setFullUserData(response.data);
                    
                    // Запрашиваем геолокацию только если координаты не указаны
                    if (!response.data.latitude || !response.data.longitude) {
                        if (navigator.geolocation) {
                            console.log('asking position')
                            navigator.geolocation.getCurrentPosition(
                                async (position) => {
                                    try {
                                        // Отправляем координаты на сервер
                                        await axios.post(`${API_BASE_URL}/api/profile/location`, {
                                            userId: response.data._id,
                                            latitude: position.coords.latitude,
                                            longitude: position.coords.longitude
                                        });
                                    } catch (error) {
                                        console.error('Ошибка при сохранении геолокации:', error);
                                    }
                                },
                                (error) => {
                                    console.error('Ошибка при получении геолокации:', error);
                                },
                                {
                                    enableHighAccuracy: true,
                                    timeout: 5000,
                                    maximumAge: 0
                                }
                            );
                        }
                    }
                } catch (error) {
                    console.error('Ошибка при получении данных пользователя:', error);
                }
            }
        };

        fetchUserData();
    }, [userData, navigate]);

    return (
        <div className="w-[100vw] flex justify-center items-start h-screen bg-cover bg-center" style={{ backgroundImage: `url(${'/backgrounds/register.png'})` }}>
            <div className="w-[373px] h-[343px] flex flex-col justify-center items-center">
                {userData && (
                    <>
                        <div className="w-full flex flex-row justify-between pl-[16px] pr-[16px] pt-[80px] relative">
                            <div className="w-[64px] h-[40px] bg-[#FFFFFF1A] rounded-[48px] flex flex-row items-center justify-center">
                                <img src="/icons/profile/coin.svg" alt="coin" className="w-[22px] h-[16px]" />
                                <span className="text-white text-[15px] font-medium pl-[4px]">{fullUserData ? fullUserData.balance : 0}</span>
                            </div>
                            <div className="relative flex-col flex items-center justify-center">
                                <div className="w-[160px] h-[160px] rounded-[50%] bg-[#FFFFFF1A]">
                                    {fullUserData?.photoUrls[0] !== null ? <img src={fullUserData?.photoUrls[0]?.url} className="w-full h-full object-cover rounded-[50%]"/> : <></>}
                                </div>
                                <button onClick={() => {userData.verified ? navigate('/profile/edit') : navigate('/profile/verify')}} className="bg-[#3D1226] w-[40px] h-[40px] rounded-[50%] absolute top-[10px] right-[10px] flex items-center justify-center">
                                    <img src="/icons/profile/settings.svg" alt="settings" className="w-[20px] h-[20px]" />
                                </button>
                                <div className="flex flex-row items-center justify-center mt-[9px] gap-[7px]">
                                    <div className="h-[26px] rounded-[40px] bg-gradient-to-r from-[#9C4DFF] to-[#FF40AC] flex items-center justify-center gap-1 px-3">
                                        {fullUserData?.purpose && purposeIcons[fullUserData.purpose] && (
                                            <img 
                                                src={purposeIcons[fullUserData.purpose]} 
                                                alt={fullUserData.purpose} 
                                                className="w-[10px] h-[10px]"
                                            />
                                        )}
                                        <span className="text-white text-[10px] font-medium whitespace-nowrap">{fullUserData?.purpose}</span>
                                    </div>
                                    <button onClick={() => toggleEditingPurpose()}><img src="/icons/profile/edit.svg" alt="edit" className="w-[15px] h-[15px] z-[1000]" /></button>
                                </div>
                                <div className="flex flex-row items-center justify-center gap-[10px] mt-[15px]">
                                    <span className="text-white text-[20px] font-medium">{userData.name}, {userData.age}</span>
                                    {fullUserData && (
                                        fullUserData.verified ? 
                                            <img src="/icons/profile/verified.svg" alt="verified" className="w-[25px] h-[25px]" /> 
                                            : 
                                            <img src="/icons/profile/question-mark.svg" alt="question-mark" className="w-[25px] h-[25px]" />
                                    )}
                                </div>
                            </div>
                            {isEditingPurpose ? (
                                <PurposeFrame onPurposeUpdate={handlePurposeUpdate} />
                            ) : <></>}
                            <div className="w-[40px] h-[40px] rounded-[50%] bg-[#FFFFFF1A] flex flex-row items-center justify-center">
                                <img src="/icons/profile/notifications.svg" alt="notifications" className="w-[20px] h-[20px]" />
                            </div>
                        </div>
                        <div className="w-full flex flex-row justify-between pl-[16px] pr-[16px] mt-[25px]">
                            <div className="w-full h-[118px] bg-[#675B78] rounded-[32px] relative">
                                <textarea
                                    value={aboutMeText}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 500) {
                                            setAboutMeText(e.target.value);
                                        }
                                    }}
                                    onBlur={handleAboutMeSave}
                                    className="w-full h-full bg-transparent text-white text-[14px] resize-none focus:outline-none p-4 pb-8"
                                    placeholder={t('profile.about_me')}
                                    maxLength={500}
                                />
                                <div className="absolute bottom-2 right-4 text-[12px] text-[#FFFFFF80]">
                                    {aboutMeText.length}/500
                                </div>
                            </div>
                        </div>
                    </>
                )}
                
            </div>
            <Navigation/>
        </div>
    );
}

export default Profile;
