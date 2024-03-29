import Head from "next/head";
import {withAuth} from "@/lib/withAuth";
import {Tab, Menu} from "@headlessui/react";
import {Fragment, useEffect, useState, useRef} from "react";
import {auth, db} from "@/lib/firebase";
import {addDoc, deleteDoc, getDocs, collection, onSnapshot, orderBy, query, serverTimestamp, where} from "firebase/firestore";
import {AiOutlinePlus, AiOutlineSend, AiOutlineDelete} from "react-icons/ai";
import {MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight} from "react-icons/md";
import {useForm} from "react-hook-form";
import {useMediaQuery} from "react-responsive";

function Home() {

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState("ChatGPT");
    const [messages, setMessages] = useState([]);
    const {register, handleSubmit, reset} = useForm();
    const {register:registerRoom, handleSubmit: handleSubmitRoom, reset: resetRoom} = useForm();
    const messagesEndRef = useRef(null);
    const [showNewRoom, setShowNewRoom] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const [generatedText, setGeneratedText] = useState('');
    const [prompt, setPrompt] = useState('');
    let prevAuthor = null;



    const handleSubmitChatGPT = async () => {

        console.log(prompt)

        const res = await fetch('/api/chatGPT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        setGeneratedText(data.response.content);


    };

    // call handleSubmitChatGPT whenever prompt changes
    useEffect(() => {
        if (prompt) {
            handleSubmitChatGPT().then(r => console.log("ChatGPT Success: " + r));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prompt]);

    useEffect(() => {
        if (generatedText) {
           // noinspection JSUnusedLocalSymbols
            const docRef = addDoc(collection(db, "Messages"), {
                author: "ChatGPT",
                createdAt: serverTimestamp(),
                message: generatedText,
                room: "ChatGPT",
            })
        }
    }, [generatedText]);


    // eslint-disable-next-line react-hooks/exhaustive-deps
    function handleRoomClick(roomId) {
        setSelectedRoom(roomId)
        setLoadingMessages(true)
        setShowSidebar(false)
    }

    // call handleSubmitChatGPT whenever prompt changes

    function handleHideSidebarClick() {
        setShowSidebar(!showSidebar)
    }
    async function onSubmitMessage(data) {
        try {
            reset();
            if (selectedRoom === "ChatGPT") {
                setPrompt(data.message)
            }
            return addDoc(collection(db, "Messages"), {
                author: auth.currentUser.displayName,
                createdAt: serverTimestamp(),
                message: data.message,
                room: selectedRoom,
            })
        } catch (error) {
            console.log(error)
        }
    }

    async function handleRoomDelete(roomId) {
        try {
            const q = query(collection(db, "Rooms"), where("name", "==", roomId));
            console.log(q)
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                deleteDoc( doc.ref);
            });
            setSelectedRoom("Welcome")

        } catch (error) {
            console.log(error)
        }

    }
    async function handleMessageDelete(createdAt, author, room) {
        try {
            const q = query(
                collection(db, "Messages"),
                where("createdAt", "==", createdAt),
                where("author", "==", author),
                where("room", "==", room)
            );
            console.log(q)
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                deleteDoc( doc.ref);
            });

        } catch (error) {
            console.log(error)
        }

    }

    async function onSubmitRoom(data) {
        try {
            const querySnapshot = await getDocs(query(collection(db, "Rooms"), where("name", "==", data.room)));
            resetRoom()
            if (querySnapshot.size > 0) {
                alert("Room already exists.")
            } else {
                return await addDoc(collection(db, "Rooms"), {
                    name: data.room.charAt(0).toUpperCase() + data.room.slice(1),
                    createdAt: serverTimestamp(),
                })
                    .finally(
                        setShowNewRoom(false),
                    )
            }
        } catch (error) {
            console.log(error)
        }
    }

    function handleAddRoomClick() {
        setShowNewRoom(!showNewRoom)
        resetRoom();
    }

    function handleLogOut() {
        auth.signOut().then(r => console.log("Signed Out", {r}))
    }

    function isImageUrl(url) {
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
        const extension = String(url).split(".").pop();
        return imageExtensions.includes(extension.toLowerCase());
    }

    useEffect(() => {
        console.log(messages);
    }, [messages]);

    useEffect(() => {
        // Fetch all messages for the selected room from the Firebase database
        if (selectedRoom) {
            const q = query(
                collection(db, "Messages"),
                where("room", "==", selectedRoom),
                orderBy("createdAt", "asc")
            );
            return onSnapshot(q, (snapshot) => {
                const messagesData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMessages(messagesData);
                setLoadingMessages(false);
            });
        }
    }, [selectedRoom]);

    useEffect(() => {
        const q = query(
            collection(db, "Rooms"),
            orderBy("createdAt", "asc")
        )
        return onSnapshot(q, (snapshot) => {
            const roomsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setRooms(roomsData);
            setLoadingRooms(false)
        });
    }, []);

    useEffect(() => {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }, [messages]);

  return (
      <>
        <Head>
          <title>Chat - Home</title>
          <meta name="description" content="Chat app for you and your friends!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <main className={"absolute inset-0 flex bg-discordGrey-std"}>
            <div className={`lg:w-1/5 lg:relative lg:mr-0 absolute inset-0 mr-8 bg-discordGrey-darker flex flex-col  ${ isDesktop || showSidebar ? 'block' : 'hidden' }`}>
                <div className={"flex flex-row justify-center items-center"}>
                    <div>
                        <Menu>
                            <Menu.Button className={"mx-4 bg-discordGrey-dark rounded-full text-slate-300 h-8 w-8 flex justify-center items-center"}>{auth.currentUser.displayName[0]}</Menu.Button>
                            <Menu.Items>
                                <Menu.Item>
                                    <button onClick={handleLogOut} className={" flex justify-center items-center flex-col absolute ml-2 text text-slate-300 mt-1 p-2 rounded-lg bg-discordGrey-dark z-50 hover:bg-slate-300 hover:text-black"}>
                                        Log Out
                                    </button>
                                </Menu.Item>
                            </Menu.Items>
                        </Menu>
                    </div>

                    <h1 className={"flex-1 font-bold py-4 text-slate-300 text-[20px] border-b border-discordGrey-dark"}>Hey, {auth.currentUser.displayName}</h1>
                    <button onClick={handleAddRoomClick} className={"p-3 m-4 text-slate-300 bg-discordGrey-dark rounded-lg flex items-center justify-center transition hover:bg-slate-300 hover:text-black "}>
                        <AiOutlinePlus className={""}/>
                    </button>
                    {!isDesktop &&
                        <button onClick={handleHideSidebarClick} className={"p-4 text-slate-300"}>
                            <MdOutlineKeyboardArrowLeft/>
                        </button>}

                </div>
                <div className={"overflow-y-scroll scrollbar-hide flex-1"}>
                    <Tab.Group vertical selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                        <Tab.List className={"flex gap-4 flex-col "}>
                            {loadingRooms ? (
                                <p className={"text-center text-slate-300 p-4"}>Loading...</p>
                            ) : (
                                <>
                                {rooms.map((room) => (
                                        <Tab  as={Fragment} key={room.id}>
                                                <div
                                                    onClick={() => handleRoomClick(room.name)}
                                                    className={
                                                        room.name === selectedRoom ? 'flex justify-between p-4 mx-4 m-2 rounded-lg bg-slate-200 translate-x-1 font-bold' : 'flex justify-between p-4 mx-4 m-2 bg-discordGrey-std text-slate-400 rounded-lg transition transform hover:translate-x-1 hover:bg-slate-300 hover:text-black'
                                                    }
                                                >
                                                    <p>{room.name}</p>
                                                    {room.name !== "ChatGPT" && (
                                                        <button onClick={() => handleRoomDelete(room.name)}>
                                                            <AiOutlineDelete/>
                                                        </button>
                                                    )}
                                                </div>
                                        </Tab>

                                    ))}
                                </>
                            )}

                        </Tab.List>
                    </Tab.Group>
                    {showNewRoom &&
                        <form  onSubmit={handleSubmitRoom(onSubmitRoom)} className={" mx-4 mt-6 rounded-lg transition transform translate-x-1 text-black"}>
                            <input autoFocus={true} autoCapitalize={"on"} className={"bg-slate-300 w-full h-full p-4 rounded-lg"} type="text" placeholder={"Room name..."} {...registerRoom("room", {required: true})}/>
                        </form>
                    }
                </div>
            </div>
            <div className={"flex-1 h-full bg-slate-300 flex flex-col"}>
                <div className={"text-center font-bold py-4 text-[18px] bg-discordGrey-dark shadow-xl flex"}>
                    {!isDesktop &&
                    <button onClick={handleHideSidebarClick} className={"px-4 text-slate-300"}>
                           <MdOutlineKeyboardArrowRight/>
                    </button>
                    }
                    <h1 className={"flex-1 pr-16 text-slate-300"}>{selectedRoom}</h1>
                </div>
                <div ref={messagesEndRef} className={"bg-discordGrey-std w-full h-full pt-2 overflow-y-scroll"}>
                    {loadingMessages ? (
                        <p className={"text-center text-slate-300 p-4"}>Loading...</p>
                    ) : (
                        <>
                            {messages.map((message) => {
                                const isCurrentUser = message.author === auth.currentUser.displayName;
                                const isSameAuthor = prevAuthor === message.author;
                                const imageUrl =isImageUrl(message.message);
                                prevAuthor = message.author;

                                return (
                                    <>
                                        <div key={message.id} className={`flex flex-row ${isCurrentUser ? 'justify-end ml-32 lg:ml-[46rem] text-end' : 'justify-start mr-32 lg:mr-[46rem] text-start'}`}>
                                            <div className={`flex flex-col text-sm px-4 pt-2 text-slate-300`}>
                                                {!isSameAuthor &&
                                                    <div className={`flex items-center gap-2 ${isCurrentUser ? 'items-end ml-40 text-end flex-row-reverse' : 'items-end mr-40 text-start'}`}>
                                                        {message.author === "ChatGPT" ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img  className={" mt-2 mb-2 bg-discordGrey-dark rounded-full text-slate-300 h-8 w-8 flex justify-center items-center"} src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.glassdoor.com%2Fsqll%2F2210885%2Fopenai-squarelogo-1560841328266.png&f=1&nofb=1&ipt=2b3aaa1bd4b087aa9aa694dcc0608f7063f7acf57f013e6aa4c67d5a1bb56f32&ipo=images" alt="OpenAi Logo"/>
                                                        ) : (
                                                            <p className={" mt-2 mb-2 bg-discordGrey-dark rounded-full text-slate-300 h-8 w-8 flex justify-center items-center"}>{message.author[0]}</p>
                                                        )}

                                                        <p className={`mb-2 text-[18px] font-bold ${message.author === "ChatGPT" ? "text-green-300" : "text-blue-500"}`}>{message.author}</p>
                                                    </div>
                                                    }
                                                <div  className={`flex justify-end flex-row gap-2 ${isCurrentUser ? 'flex-row' : 'flex-row-reverse'}`}>
                                                    {isCurrentUser &&
                                                        <button onClick={() => handleMessageDelete( message.createdAt, message.author, message.room)}>
                                                            <AiOutlineDelete/>
                                                        </button>}
                                                    {imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img width={300} height={300} className={"bg-discordGrey-light rounded-lg p-2 text-[16px]"} alt={"Message Image"} src={message.message}/>
                                                    ) : (
                                                        <p className={"bg-discordGrey-light rounded-lg p-2 text-[16px] break-normal"}>{message.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </>
                                );
                            })}
                        </>
                    )}
                </div>
                <div className={"bg-gradient-to-b from-discordGrey-std to-discordGrey-dark"}>
                    <div className={" flex justify-center items-center"}>
                        <form action="" onSubmit={handleSubmit(onSubmitMessage)} className={" flex mb-5 mt-3 w-full lg:px-20 px-8"}>
                            <input type="text" autoComplete={"off"} className={"w-full shadow-xl rounded-r-none rounded-lg p-2 bg-discordGrey-dark placeholder-gray-400 placeholder-opacity-60 text-slate-300"} placeholder={"Message..."} {...register("message", {required: true})} />
                            <button type={"submit"} className={""}>
                                <AiOutlineSend className={"h-11 w-11 flex-1 rounded-lg  shadow-xl rounded-l-none p-3 bg-discordGrey-dark text-gray-400 transition hover:bg-discordGrey-light"}/>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
      </>
  )
}

export default withAuth(Home)
