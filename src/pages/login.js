import Head from "next/head";
import {useState} from "react";
import Login from "@/components/login";
import Register from "@/components/register";
import Image from "next/image";

export default function Loginpage() {

    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    function handleBackClick() {
        setShowLogin(false)
        setShowRegister(false)
    }
    function handleLoginClick() {
        setShowLogin(!showLogin)
    }
    function handleRegisterClick() {
        setShowRegister(!showRegister)
    }

    return (
        <>
            <Head>
                <title>Chat - Login</title>
                <meta name="description" content="Chat app for you and your friends!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className={"h-screen bg-discordGrey-dark flex flex-col justify-center items-center gap-3"}>
                <div>
                    <Image src={"/frontSvg.svg"} width={500} height={345}/>
                </div>
                <div>
                    <h1 className={"font-bold text-[3rem] text-slate-300"}>Welcome.</h1>
                </div>
                <div onClick={handleBackClick} className={"absolute h-screen w-screen"}></div>
                <button onClick={handleLoginClick} className={" z-20 p-4 bg-discordGrey-light rounded-lg font-bold transition hover:bg-white"}>Log In</button>
                <button onClick={handleRegisterClick} className={" z-20 p-4 bg-discordGrey-light rounded-lg font-bold transition hover:bg-white"}>Create Account </button>
                {showLogin && <Login/>}
                {showRegister && <Register setShowRegister={setShowRegister} setShowLogin={setShowLogin}/>}
            </main>
        </>
    )
}