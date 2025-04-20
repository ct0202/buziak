import NavigationBar from '../../components/Navigation';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

function Wallet() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userData = useSelector(state => state.user.userData);
    return (
        <div className="w-[100vw] h-screen bg-cover bg-center" style={{ backgroundImage: `url(${'/backgrounds/register.png'})` }}>
            <div className="w-full flex flex-col justify-start items-start">
                <div className="w-[80%] flex items-start justify-between pl-[16px] pt-[16px]">
                    <button onClick={() => navigate(-1)} className="rounded-[50%] flex items-center justify-center w-[52px] h-[52px] bg-[#FF63BBB8]">
                        <img src="/icons/back-arrow-black.svg" alt="arrow-left" className="w-[24px] h-[24px]" />
                    </button>
                    <div className="flex flex-col justify-center items-center">
                        <span className="text-[32px] text-white font-[500]">{t('wallet.your_balance')}</span>
                        <div className="w-[64px] h-[40px] mt-[26px] bg-[#FFFFFF1A] rounded-[48px] flex flex-row items-center justify-center">
                                <img src="/icons/profile/coin.svg" alt="coin" className="w-[22px] h-[16px]" />
                                <span className="text-white text-[15px] font-medium pl-[4px]">0</span>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col items-center justify-center pt-[25px]">
                    <button 
                            className="w-[279px] h-[39px] rounded-[40px] bg-gradient-to-r from-[#9C4DFF] to-[#FF40AC] px-8 py-2 flex flex-row items-center justify-center gap-4 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
                        >
                            <span className="text-white">{t('wallet.buy')}</span>
                            <img src="/icons/profile/coin.svg" alt="coin" className="w-[22px] h-[16px]" />
                            <span className="text-white">100</span>
                            <span className="text-white text-[20px] font-[600]">9.90zl</span>
                    </button>
                    <button 
                            className="w-[279px] h-[39px] mt-[16px] rounded-[40px] bg-gradient-to-r from-[#9C4DFF] to-[#FF40AC] px-8 py-2 flex flex-row items-center justify-center gap-4 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
                        >
                            <span className="text-white">{t('wallet.buy')}</span>
                            <img src="/icons/profile/coin.svg" alt="coin" className="w-[22px] h-[16px]" />
                            <span className="text-white">300</span>
                            <span className="text-white text-[20px] font-[600]">25.90zl</span>
                    </button>
                    <button 
                            className="w-[279px] h-[39px] mt-[16px] rounded-[40px] bg-gradient-to-r from-[#9C4DFF] to-[#FF40AC] px-8 py-2 flex flex-row items-center justify-center gap-4 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
                        >
                            <span className="text-white">{t('wallet.buy')}</span>
                            <img src="/icons/profile/coin.svg" alt="coin" className="w-[22px] h-[16px]" />
                            <span className="text-white">500</span>
                            <span className="text-white text-[20px] font-[600]">39.90zl</span>
                    </button>
                </div>
            </div>
            <div className="w-full pl-[16px]">
                <NavigationBar />
            </div>
        </div>
    );
}

export default Wallet;