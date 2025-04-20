import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "../../components/Navigation";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

function Edit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userData = useSelector(state => state.user.userData);
  const [fullUserData, setFullUserData] = useState(null);
  const [user, setUser] = useState({
    username: "",
    email: "",
    gender: "",
    whoSeesMyProfile: "",
    language: "",
    birthDay: ""
  });
  const [ageTimeout, setAgeTimeout] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return { day: '1', month: '1', year: '2000' };
    const date = new Date(dateString);
    return {
      day: date.getDate().toString(),
      month: (date.getMonth() + 1).toString(),
      year: date.getFullYear().toString()
    };
  };

  const handleBirthdayChange = async (type, value) => {
    const currentDate = formatDateForInput(user.birthDay);
    let newDay = parseInt(currentDate.day);
    let newMonth = parseInt(currentDate.month);
    let newYear = parseInt(currentDate.year);

    switch(type) {
      case 'day':
        newDay = parseInt(value);
        break;
      case 'month':
        newMonth = parseInt(value);
        const daysInNewMonth = getDaysInMonth(newMonth, newYear);
        if (newDay > daysInNewMonth) {
          newDay = daysInNewMonth;
        }
        break;
      case 'year':
        newYear = parseInt(value);
        break;
    }

    const newDate = new Date(newYear, newMonth - 1, newDay);
    const isoString = newDate.toISOString();
    console.log('Sending birthday to server:', isoString);
    
    try {
      const response = await saveChanges({ birthDay: isoString });
      console.log('Server response after birthday update:', response);
      setUser(prev => ({...prev, birthDay: isoString}));
    } catch (error) {
      console.error('Error updating birthday:', error);
    }
  };

  const handleAgeChange = (e) => {
    const newAge = parseInt(e.target.value);
    setUser(prev => ({...prev, age: newAge}));
    
    // Очищаем предыдущий таймаут
    if (ageTimeout) {
      clearTimeout(ageTimeout);
    }
    
    // Устанавливаем новый таймаут
    const timeout = setTimeout(() => {
      saveChanges({ age: newAge });
    }, 500); // Задержка 500мс
    
    setAgeTimeout(timeout);
  };

  const handleWhoSeesMyProfileChange = async (value) => {
    setUser(prev => ({...prev, whoSeesMyProfile: value}));
    await saveChanges({ whoSeesMyProfile: value });
  };

  const handleLanguageChange = async (value) => {
    setUser(prev => ({...prev, language: value}));
    await saveChanges({ language: value });
  };

  const handleLookingForChange = async (value) => {
    setUser(prev => ({...prev, lookingFor: value}));
    await saveChanges({ lookingFor: value });
  };

  const handleOnlyUsersWithPhotosChange = async (value) => {
    setUser(prev => ({...prev, onlyUsersWithPhotos: value}));
    await saveChanges({ showOnlyWithPhoto: value });
  };

  const saveChanges = async (changes) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/profile`, {
        userId: userData._id,
        ...changes
      });

      if (response.status === 200) {
        setFullUserData(prev => ({
          ...prev,
          ...changes
        }));
      }
    } catch (error) {
      console.error('Ошибка при сохранении изменений:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
        if (!userData) {
            navigate('/signin');
        } else {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/profile?userId=${userData._id}`);
                console.log('Birthday from server:', response.data.birthDay);
                console.log('Full user data:', response.data);
                setFullUserData(response.data);
                setUser(prev => ({
                  ...prev,
                  username: userData.name,
                  email: userData.email,
                  gender: userData.gender,
                  whoSeesMyProfile: response.data?.whoSeesMyProfile || "ALL",
                  language: response.data?.language || "PL",
                  gender: response.data?.gender || "MALE",
                  lookingFor: response.data?.lookingFor || "GIRL",
                  onlyUsersWithPhotos: response.data?.showOnlyWithPhoto,
                  age: response.data?.age || 22,
                  birthDay: response.data?.birthDay || ''
                }));
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

  // Очищаем таймаут при размонтировании компонента
  useEffect(() => {
    return () => {
      if (ageTimeout) {
        clearTimeout(ageTimeout);
      }
    };
  }, [ageTimeout]);

  // Генерируем массивы для селектов
  const years = Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({length: 12}, (_, i) => i + 1);
  const currentDate = formatDateForInput(user.birthDay);
  const daysInMonth = getDaysInMonth(parseInt(currentDate.month), parseInt(currentDate.year));
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

  return (
    <div 
      className="w-full min-h-screen bg-cover bg-center text-white relative overflow-y-auto pb-[80px]" 
      style={{
        backgroundImage: 'url("/backgrounds/register.png")',
        height: '-webkit-fill-available'
      }}
    >
      <div className="w-full flex justify-center pt-[16px]">
        <div className="w-[343px]">
          <div className="flex items-start justify-between">
            <button onClick={() => navigate(-1)} className="rounded-[50%] flex items-center justify-center w-[52px] h-[52px] bg-[#FF63BBB8]">
              <img src="/icons/back-arrow-black.svg" alt="arrow-left" className="w-[24px] h-[24px]" />
            </button>
            <div className="flex items-center justify-center flex-col">
              <div className="w-[96px] h-[96px] rounded-[50%] border-[2px] border-white">
                {fullUserData?.photoUrls[0] !== null ? <img src={fullUserData?.photoUrls[0]?.url} className="w-full h-full object-cover rounded-[50%]"/> : <></>}
              </div>
              <button onClick={() => navigate("/profile/change-profile-picture")} className="bg-[#675B78] rounded-[15px] h-[30px] w-[193px] font-[14px] mt-[8px]">
                {t('profile.edit.change_photo')}
              </button>
            </div>
            <button onClick={() => navigate('/profile')}>
              <img src="/icons/Glyph.svg" alt="back"/>
            </button>
          </div>
          <div className="flex items-center flex-col w-full font-[14px] mt-[10px]">
            <div className="border-b border-white w-full py-[25px] flex items-center justify-between"> 
              <span className="text-[#77838F]">{t('profile.edit.username')}</span>
              <span>{fullUserData?.name}</span>
            </div>
            <div className="border-b border-white w-full py-[25px] flex items-center justify-between"> 
              <span className="text-[#77838F]">{t('profile.edit.email')}</span>
              <span>{fullUserData?.email}</span>
            </div>
            <div className="border-b border-white w-full py-[25px] flex items-center justify-between"> 
              <span className="text-[#77838F]">{t('profile.edit.birthday')}</span>
              <div className="flex gap-2">
                <select
                  value={formatDateForInput(user.birthDay).day}
                  onChange={(e) => handleBirthdayChange('day', e.target.value)}
                  className="bg-transparent text-white text-center w-[50px] focus:outline-none"
                >
                  {days.map(day => (
                    <option key={day} value={day} className="bg-[#675B78]">
                      {day.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={formatDateForInput(user.birthDay).month}
                  onChange={(e) => handleBirthdayChange('month', e.target.value)}
                  className="bg-transparent text-white text-center w-[50px] focus:outline-none"
                >
                  {months.map(month => (
                    <option key={month} value={month} className="bg-[#675B78]">
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={formatDateForInput(user.birthDay).year}
                  onChange={(e) => handleBirthdayChange('year', e.target.value)}
                  className="bg-transparent text-white text-center w-[70px] focus:outline-none"
                >
                  {years.map(year => (
                    <option key={year} value={year} className="bg-[#675B78]">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-b border-white w-full py-[25px] flex items-center justify-between"> 
              <span className="text-[#77838F]">{t('profile.edit.who_sees')}</span>
              <div className="w-[120px] h-[32px] rounded-[100px] bg-[#FFFFFF66] flex flex-row items-center justify-between px-[1px]">
                <button onClick={() => handleWhoSeesMyProfileChange("ALL")} 
                        className={`text-[12px] w-[30px] h-[30px] rounded-[50%] 
                        ${user.whoSeesMyProfile === "ALL" ? "bg-[#FFFFFF] text-black" : "bg-[#FFFFFF80] text-[#1B1B1BA6]"}`}>
                  ALL
                </button>
                <span>:</span>
                <button onClick={() => handleWhoSeesMyProfileChange("MAN")} 
                        className={`text-[12px] w-[30px] h-[30px] rounded-[50%]
                        ${user.whoSeesMyProfile === "MAN" ? "bg-[#3C8AFF] text-black" : " bg-[#FFFFFF80] text-[#1B1B1BA6] "}`}>
                  MAN
                </button>
                <span>:</span>
                <button onClick={() => handleWhoSeesMyProfileChange("GIRL")} 
                        className={`text-[12px] w-[30px] h-[30px] rounded-[50%] 
                        ${user.whoSeesMyProfile === "GIRL" ? "bg-[#FF94D1] text-black" : "bg-[#FFFFFF80] text-[#1B1B1BA6] "}`}>
                  GIRL
                </button>
              </div>
            </div>
            <div className="border-b border-white w-full py-[25px] flex items-center justify-between"> 
              <span className="text-[#77838F]">{t('profile.edit.language')}</span>
              <div className="w-[81px] h-[32px] rounded-[100px] bg-[#FFFFFF66] flex flex-row items-center justify-between px-[1px]">
                <button onClick={() => handleLanguageChange("EN")} 
                        className={`text-[12px] w-[30px] h-[30px] rounded-[50%] 
                        ${user.language === "EN" ? "bg-[#FFFFFF] text-black" : "bg-[#FFFFFF80] text-[#1B1B1BA6]"}`}>
                  EN
                </button>
                <span>:</span>
                <button onClick={() => handleLanguageChange("PL")} 
                        className={`text-[12px] w-[30px] h-[30px] rounded-[50%]
                        ${user.language === "PL" ? "bg-[#FFFFFF] text-black" : " bg-[#FFFFFF80] text-[#1B1B1BA6] "}`}>
                  PL
                </button>
              </div>
            </div>
            <div className="border-b border-white w-full py-[25px] flex items-center justify-between"> 
              <span className="text-[#77838F]">{t('profile.edit.only_photos')}</span>
              <button onClick={() => handleOnlyUsersWithPhotosChange(!user.onlyUsersWithPhotos)}>
                {user.onlyUsersWithPhotos ? <img src="/icons/Checkbox.svg"/> : <div className="w-[24px] h-[24px] rounded-[5px] border border-white"/>}
              </button>
            </div>
          </div>
          <div className="w-full py-[25px] flex flex-col gap-2">
              <div className="flex justify-center items-center">
                <span className="text-white">{user.age} {t('profile.edit.years')}</span>
              </div>
              <div className="relative w-full h-[6px] bg-[#EAEDF0]">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[13px] h-[13px] rounded-full bg-[#FF63BB] -ml-[6px]" />
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[13px] h-[13px] rounded-full bg-[#EAEDF0] -mr-[6px]" />
                <input
                  type="range"
                  min="18"
                  max="99"
                  value={user.age}
                  onChange={handleAgeChange}
                  className="absolute w-full h-[6px] appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF63BB] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF63BB] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
                />
                <div 
                  className="absolute h-full bg-[#FF63BB]" 
                  style={{width: `${((user.age - 18) / (99 - 18)) * 100}%`}}
                />
              </div>
              <div className="flex justify-between text-xs text-white/50">
                <span>18</span>
                <span>99</span>
              </div>
            </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex justify-center bg-[#1B1B1B]">
        <div className="w-[343px]">
          <Navigation />
        </div>
      </div>
    </div>
  );
}

export default Edit;
