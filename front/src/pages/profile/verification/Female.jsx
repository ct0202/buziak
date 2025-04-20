import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function FemaleVerify() {
    const { t } = useTranslation();
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const userData = useSelector(state => state.user.userData);
    const navigate = useNavigate();

    const capturePhoto = async () => {
        if (!videoRef.current || !userData?._id) {
            console.error(t('errors.no_camera_or_id'));
            return;
        }
        
        setIsLoading(true);
        try {
            // Создаем canvas для захвата кадра
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);
            
            // Конвертируем в blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
            
            // Создаем FormData для отправки
            const formData = new FormData();
            formData.append('photo', blob, 'verification.jpg');
            formData.append('userId', userData._id);
            
            // Отправляем фото на сервер
            const response = await axios.post(`${API_BASE_URL}/api/profile/verification`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.status === 200) {
                console.log(t('success.photo_sent'), userData._id);
                navigate('/profile');
            }
        } catch (error) {
            console.error(t('errors.photo_send_error'), error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'user',
                        width: { exact: 152 },
                        height: { exact: 223 }
                    } 
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error(t('errors.camera_access_error'), err);
            }
        };

        startCamera();

        // Очистка при размонтировании
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="w-full h-screen flex justify-center items-start bg-cover bg-center" style={{ backgroundImage: `url(${'/backgrounds/register.png'})` }}  >
            <div className="w-[373px] flex flex-col justify-center items-center pt-[128px] text-white">
                <div className="w-[327px] bg-[#675B78] h-[530px] rounded-[32px] flex flex-col justify-start items-center">
                    <div className="w-[152px] h-[500px] mt-[37px] overflow-hidden rounded-[50%] border-2 border-white">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-[24px] mt-[34px]">{t('profile.verify.title')}</span>
                    <p className="w-[279px] text-[14px] text-center mt-[40px]">{t('profile.verify.description')}</p>
                    <button 
                        onClick={capturePhoto}
                        disabled={isLoading}
                        className="w-[279px] h-[39px] mt-[12px] cursor-pointer"
                    >
                        <img src="/icons/profile/im-ready-button.svg" alt="im-ready" className="w-full h-full"/>
                    </button>
                    <button className="w-[279px] h-[39px] mt-[7px] mb-[20px] cursor-pointer">
                        <img onClick={() => navigate('/profile/edit')} src="/icons/profile/later-button.svg" alt="later" className="w-full h-full"/>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FemaleVerify;