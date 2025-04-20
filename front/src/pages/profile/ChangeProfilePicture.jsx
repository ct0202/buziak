import { useNavigate } from "react-router-dom";
import NavigationBar from "../../components/Navigation";
import {useState, useEffect, useRef} from "react";
import { useTranslation } from "react-i18next";
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { useSelector } from 'react-redux';

function ChangeProfilePicture() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const token = useSelector(state => state.user.token);
    const userData = useSelector(state => state.user.userData);
    const userId = userData._id;
    console.log(userId);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState([
        null, 
        null, 
        null, 
        null, 
        null,  
        null, 
        null, 
        null, 
        null
    ]);
    const fileInputRefs = useRef(Array(9).fill(null));

    const getAuthHeader = () => {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/profile/photos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        userId: userId
                    }
                });

                if (response.data && Array.isArray(response.data)) {
                    const newImages = [...images];
                    let hasPhotos = false;
                    response.data.forEach(photo => {
                        if (photo.position >= 0 && photo.position < 9) {
                            newImages[photo.position] = photo.url;
                            hasPhotos = true;
                        }
                    });
                    setImages(newImages);
                    // Если есть фотографии, включаем режим редактирования
                    if (hasPhotos) {
                        setIsEditing(true);
                    }
                }
            } catch (error) {
                console.error('Ошибка при загрузке фотографий:', error);
                if (error.response?.status === 401) {
                    // navigate('/signin');
                    // return;
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchPhotos();
    }, [userId, token]);

    const handleImageChange = async (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImages = [...images];
                newImages[index] = reader.result;
                setImages(newImages);
            };
            reader.readAsDataURL(file);

            // Создаем FormData и отправляем файл
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('position', index);
            formData.append('userId', userId);

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            };

            try {
                setIsLoading(true);
                const response = await axios.post(`${API_BASE_URL}/api/profile/photos`, formData, {
                    headers
                });
                console.log('Фото успешно загружено:', response.data);
            } catch (error) {
                console.error('Ошибка при загрузке фото:', error);
                if (error.response?.status === 401) {
                    navigate('/signin');
                    return;
                }
                // В случае ошибки очищаем превью
                const newImages = [...images];
                newImages[index] = null;
                setImages(newImages);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAddPhotoClick = (index) => {
        if (!isLoading) {
            fileInputRefs.current[index].click();
        }
    };

    const handleDeletePhoto = async (index) => {
        const headers = getAuthHeader();
        if (!headers) return;

        try {
            setIsLoading(true);
            await axios.delete(`${API_BASE_URL}/api/profile/photos/${index}`, {
                headers,
                data: {
                    userId: userId
                }
            });
            const newImages = [...images];
            newImages[index] = null;
            setImages(newImages);
        } catch (error) {
            console.error('Ошибка при удалении фото:', error);
            if (error.response?.status === 401) {
                navigate('/signin');
                return;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-screen pl-[10px] pr-[10px] pt-[16px] bg-cover bg-center text-white relative overflow-hidden flex flex-col justify-start items-center" 
        style={{
            backgroundImage: 'url("/backgrounds/register.png")'
        }}>
            <button 
                onClick={() => navigate("/profile")} 
                className="text-[#00BBFF] text-[20px] pr-[40px] text-right w-full"
                disabled={isLoading}
            >
                {isLoading ? t('common.loading') : t('common.done')}
            </button>
            <div className="w-[343px]">
                <div className="flex items-start justify-center gap-[2px]">
                    <button 
                        className={`border-b-[2px] w-[113px] h-[42px] py-[12px] ${isEditing ? "border-b-[#F761B6] text-[#F761B6]" : "border-b-[#FFFFFFB2] text-[#FFFFFFB2]"}`} 
                        onClick={() => setIsEditing(true)}
                        disabled={isLoading}
                    >
                        {t('profile.photos.edit')}
                    </button>
                    <button 
                        className={`border-b-[2px] w-[113px] h-[42px] py-[12px] ${isEditing ? "border-b-[#FFFFFFB2] text-[#FFFFFFB2]" : "border-b-[#F761B6] text-[#F761B6]"}`} 
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                    >
                        {t('profile.photos.preview')}
                    </button>
                </div>
            </div>
            <div className="w-full flex items-center mt-[26px] justify-center">
                <div className="w-full grid grid-cols-3 gap-[12px]">
                    {images.map((image, index) => (
                        <div key={index} className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                ref={el => fileInputRefs.current[index] = el}
                                onChange={(e) => handleImageChange(index, e)}
                                className="hidden"
                                disabled={isLoading}
                            />
                            <div 
                                className={`w-[113px] h-[136px] bg-[#675B78] rounded-[32px] flex justify-center items-center ${!isLoading ? 'cursor-pointer' : ''}`}
                                onClick={() => isEditing && !isLoading && handleAddPhotoClick(index)}
                            >
                                {image ? (
                                    <img src={image} alt="profile" className="w-full h-full rounded-[32px] object-cover" />
                                ) : (
                                    <img src="/icons/profile/add-photo.svg" alt="add-photo" className="w-[26px] h-[26px]"/>
                                )}
                            </div>
                            {isEditing && image && (
                                <div 
                                    className="absolute bottom-[-8px] right-[-8px] w-[27px] h-[27px] flex items-center justify-center cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePhoto(index);
                                    }}
                                >
                                    <img src="/icons/profile/delete-photo.svg" alt="delete-photo" className="w-[27px] h-[27px]"/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <NavigationBar />
        </div>
    );
}

export default ChangeProfilePicture;
