import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const withAuth = (WrappedComponent) => {
    const Wrapper = (props) => {
        const router = useRouter();
        const auth = getAuth();
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/login');
                } else {
                    setLoading(false);
                }
            });
            return () => unsubscribe();
        }, []);

        if (loading) {
            return <div className={"absolute inset-0 bg-discordGrey-dark font-bold text-slate-300 flex justify-center items-center text-[4rem]"}>Checking credentials...</div>;
        }

        return <WrappedComponent {...props} />;
    };

    return Wrapper;
};
