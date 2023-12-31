import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/thread.action";
import { fetchUser } from "@/lib/actions/user.action";
import Thread from "@/lib/models/thread.model";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
const Page = async({params}:{params:{id:string}})=>{
    if(!params.id) return null;

    const user=  await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);
    if(!userInfo.onboarded) redirect('/onboarding');

    const thread = await fetchThreadById(params.id);
    const originalThread = await Thread.findById(params.id);
    console.log("userInfo_id",userInfo._id);
    return(
        
        <section className="relative">
            <div>
                <ThreadCard 
                    key={thread._id}
                    id={thread._id}
                    // currentUser_id={JSON.stringify(userInfo?._id)||""}//
                    currentUserId={user?.id || ""}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                    isLike={originalThread?.likes}
                    // isComment
                />
            </div>
            <div className="mt-7">
                <Comment threadId={thread.id} currentUserImg={user.imageUrl} isLike={originalThread?.likes} currentUserId={JSON.stringify(userInfo._id)}/>
            </div>
            <div className="mt-10">
                {thread.children.map((childItem:any) =>(
                    <ThreadCard   
                        key={childItem._id}
                        id={childItem._id}
                        // currentUser_id={childItem._id}
                        currentUserId={user?.id || ""}
                        parentId={childItem.parentId}
                        content={childItem.text}
                        author={childItem.author}
                        community={childItem.community}
                        createdAt={childItem.createdAt}
                        comments={childItem.children}
                        isComment
                        isLike={childItem?.likes}
                    />
                ))}
            </div>
        </section>
)
}

export default Page;