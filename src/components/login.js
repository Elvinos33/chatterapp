import {useForm} from "react-hook-form";
import {signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "@/lib/firebase";
import {useRouter} from "next/router";


export default function Login() {

    const {register, handleSubmit, reset} = useForm();
    const router = useRouter()

    function onSubmit(data) {
        signInWithEmailAndPassword(auth, data.email, data.password)
            .then((userCredential) => {
                // User logged in successfully
                const user = userCredential.user;
                console.log('User logged in successfully:', user);
                router.push("/")
                reset();
            })
            .catch((error) => {
                // Handle login errors
                console.log(error)
            });
    }

    return (
        <>
            <div className={"w-[20rem] bg-discordGrey-std rounded-lg shadow-xl z-50 absolute flex flex-col"}>
                <h1 className={"text-center font-bold mt-5 text-[1.5rem] text-slate-300"}>Log In</h1>
                <form onSubmit={handleSubmit(onSubmit)} className={"flex flex-col gap-6"}>
                    <input type="email" className={"mx-4 mt-6 px-2 rounded-lg h-10 bg-discordGrey-light text-slate-300"} placeholder={"Email..."} {...register("email", {required: true})}/>
                    <input type="password" className={"mx-4 px-2 rounded-lg h-10 bg-discordGrey-light text-slate-300"} placeholder={"Password..."} {...register("password", {required: true})}/>
                    <button className={"my-4 mx-4 rounded-lg p-4 bg-discordGrey-dark text-slate-300 font-bold transition hover:bg-slate-300 hover:text-discordGrey-darker"}>Log In</button>
                </form>
            </div>
        </>
    )
}