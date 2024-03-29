import { useForm } from 'react-hook-form';
import {auth, db} from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";


export default function Register({setShowLogin, setShowRegister}) {

    const {register, handleSubmit, reset} = useForm();

    const onSubmit = async (data) => {
        try {

            if (data.password === data.confirm) {
                // noinspection JSUnusedLocalSymbols
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                await updateProfile(auth.currentUser, {
                    displayName: data.displayName// Signed in
                })

                // noinspection JSUnusedLocalSymbols
                const docRef = addDoc(collection(db, "Users"), {
                    email: data.email,

                })

                reset();
                setShowRegister(false)
                setShowLogin(true)
            } else {
                alert("Passwords do not match")
            }

            // ...
        } catch (error) {
            console.log(error)
            // ...
        }
    };


    return (
        <>
            <div className={"w-[20rem] bg-discordGrey-std rounded-lg shadow-xl z-50 absolute flex flex-col"}>
                <h1 className={"text-center font-bold mt-5 text-[1.5rem] text-slate-300"}>Create Account</h1>
                <form onSubmit={handleSubmit(onSubmit)} className={"flex flex-col gap-6"}>
                    <input
                        type="text"
                        className={"mx-4 mt-6 px-2 rounded-lg h-10 bg-discordGrey-light text-slate-300"}
                        placeholder={"Username..."}
                        {...register("displayName", {required: true})}
                    />
                    <input
                        type="email"
                        className={"mx-4 px-2 rounded-lg h-10 bg-discordGrey-light text-slate-300"}
                        placeholder={"Email..."}
                        {...register("email", {required: true})}
                    />
                    <input type="password" className={"mx-4 px-2 rounded-lg h-10 bg-discordGrey-light text-slate-300"} placeholder={"Password..."} {...register("password", {required: true})}/>
                    <input type="password" className={"mx-4 px-2 rounded-lg h-10 bg-discordGrey-light text-slate-300"} placeholder={"Confirm Password..."} {...register("confirm", {required: true})}/>
                    <button type="submit" className={" my-4 mx-4 rounded-lg p-4 bg-discordGrey-dark text-slate-300 font-bold transition hover:bg-slate-300 hover:text-discordGrey-darker"}>Create Account</button>
                </form>
            </div>
        </>
    )
}