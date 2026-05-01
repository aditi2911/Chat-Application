import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({children}) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket, axios} = useContext(AuthContext)

    //function to get all users for sidebar
    const getUsers = async () => {
        try {
            const {data} = await axios.get("/api/messages/users")
            if(data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to get messages for selected user
    const getMessages = async (userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`)
            if(data.success) {
                setMessages(data.messages)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to send message to selected user
    const sendMessages = async (messageData) => {
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if(data.success) {
                setMessages((prevMessages)=>[...prevMessages, data.newMessage])
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to subscribe to messages for slelcted user
    const subscribeToMessages = async() => {
        if(!socket || !socket.connected) return;

        socket.on("newMessage", (newMessage)=> {
            const isMessageFromSelectedUser = selectedUser && newMessage.senderId === selectedUser._id;
            if(isMessageFromSelectedUser) {
                setMessages((prevMessages)=> [...prevMessages, { ...newMessage, seen: true }])
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(console.error);
            } else {
                setUnseenMessages((prevUnseenMessages)=> ({
                    ...prevUnseenMessages, [newMessage.senderId] :
                    prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] +1 : 1
                }))
            }
        })
    }

    //function to unsubscribe from messages
    const unsubscribeFromMessages = ()=> {
        socket?.off("newMessage")
    }

    useEffect(()=> {
        subscribeToMessages();

        return () => unsubscribeFromMessages();
    },[socket, selectedUser, socket?.connected])

    const value = {
        messages, users, selectedUser, getUsers, getMessages, sendMessages,  setSelectedUser, unseenMessages,setUnseenMessages
    }

    return (
       <ChatContext.Provider value={value}>
         {children}
       </ChatContext.Provider>
    )
}