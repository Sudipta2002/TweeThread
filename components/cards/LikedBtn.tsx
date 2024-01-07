"use client";

import { addLikeToThread, checkLikedOrNot } from "@/lib/actions/thread.action";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [likeLength,setLikeLength] = useState(0);
  const [liked,setLiked] = useState(false);
  const [mounted, setMounted] = useState(false);
  // console.log(isLike?.includes({author:{id:currentUserId}}));
  const handleCheck=async()=>{
    const ans = await checkLikedOrNot(threadId, currentUserId);
    setLikeLength(ans.length);
    setLiked(ans.hasLiked);
    console.log("hh");
      // const userLiked = isLike?.some((like) => like?.author?.id === currentUserId);
      //   setLiked(userLiked);
      //   setLikeLength(isLike?.length);
  }
  useEffect(() => {
    if(currentUserId){
      handleCheck();
    }
      // if(isLike){
      //   console.log(isLike);
      //   const userLiked = isLike?.some((like) => like?.author?.id === currentUserId);
      //   setLiked(userLiked);
      //   setLikeLength(isLike?.length);
      // }
      console.log("useEffect executed after initial render");
  }, []); 

  const handleLikeClick = async () => {
        try { 
          // console.log("sdf")
          const ans = await addLikeToThread(threadId, currentUserId);
          // console.log(ans);
          setLikeLength(ans.length);
          setLiked(ans.hasLiked);
          console.log("Clicked Like Button");
        } catch (error) {
          console.error("Error adding like:", error);
        }
      };
  return (
    <div className="flex">
        <Image 
          src={(liked)? '/assets/heart-filled.svg' : '/assets/heart-gray.svg'}
          alt='heart'
          width={24}
          height={24}
          className='cursor-pointer object-contain'
          onClick={handleLikeClick}
        />
        <p className="text-lime-200">{(likeLength>0)?likeLength:''}</p>
    </div>
  )
} 