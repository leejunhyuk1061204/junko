import React from 'react';
import LoginPage from "@/app/component/login/page";
import MainPage from "@/app/component/mainPage/page";

const Page = () => {
    return (
        <>
            {typeof window !== 'undefined' && (
                sessionStorage.getItem('token') === null ||
                sessionStorage.getItem('token') === '' ||
                typeof sessionStorage.getItem('token') === 'undefined'
            )?<LoginPage/> : <MainPage/>}
        </>
    );
};

export default Page;