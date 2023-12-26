// "use client";

import { addLikeToThread } from "@/lib/actions/thread.action";
import Image from "next/image";

interface Props{
    threadId: string;
    currentUserId:string;
    isLike: {
        author:{
          id:string;
        }
    }[];
}

export default function LikedBtn ({threadId,currentUserId,isLike}:Props)  {
    const handleLikeClick = async () => {
          try { 
            // console.log("sdf")
            await addLikeToThread(threadId, currentUserId); 
            console.log("Clicked Like Button");
          } catch (error) {
            console.error("Error adding like:", error);
          }
        };
      
  return (
    <div>
        <Image 
        src={isLike?.length>=1? '/assets/heart-filled.svg' : '/assets/heart-gray.svg'}
        alt='heart'
        width={24}
        height={24}
        className='cursor-pointer object-contain'
        // onClick={handleLikeClick}
        />
    </div>
  )
}