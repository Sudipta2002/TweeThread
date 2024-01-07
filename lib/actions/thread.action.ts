"use server";

import { revalidatePath } from "next/cache";

import {connectToDB}  from "../mongoose";

import User from "../models/user.model";
import Thread from "../models/thread.model";
import { Luckiest_Guy } from "next/font/google";
import mongoose from "mongoose";import { ObjectId } from 'mongodb';
// import Community from "../models/community.model";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    // .populate({
    //   path: "community",
    // //   model: Community,
    // })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

interface Params {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
  try {
    connectToDB();

    // const communityIdObject = await Community.findOne(
    //   { id: communityId },
    //   { _id: 1 }
    // );

    const createdThread = await Thread.create({
      text,
      author,
      community: null, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    // if (communityIdObject) {
    //   // Update Community model
    //   await Community.findByIdAndUpdate(communityIdObject, {
    //     $push: { threads: createdThread._id },
    //   });
    // }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error}`);
  }
}

export async function fetchThreadById(threadId: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      // .populate({
      //   path: "community",
      //   model: Community,
      //   select: "_id id name image",
      // }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      }).populate({
        path:"likes",
        model: Thread,
        select:"_id"
        // populate:{
        //   path:"likes",
        // }
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}

// export async function addLikeToThread(
//   threadId: string,
//   userId: string,
// ) {
//   connectToDB();


//   try {
//       // Find the original thread by its ID
//       const originalThread = await fetchThreadById(threadId);
//       console.log(originalThread);
      
//       if (!originalThread) {
//         throw new Error("Thread not found");
//       }
//       console.log(originalThread.likes);
      
      
//       // Check if the user already liked the thread
//        let hasLiked = originalThread.likes.some(({like}:any )=>{ like.toString() === userId});

//        if (hasLiked) {
//          // If the user has already liked the thread, remove the like
//          originalThread.likes = originalThread.likes.filter(({like}:any )=>{ like.toString() === userId});
//        } else {
//          // If the user hasn't liked the thread, add the like
//          console.log("Hitted the like butttonnnn");
//          console.log({ user: userId });
       
//          originalThread.likes.push(userId);
//           await originalThread.save();
//          console.log(originalThread);
//        }
      
//     } catch (err) {
//       console.error("Error while liking comment:", err);
//       throw new Error("Unable to like comment");
//     }
// }
// export async function addLikeToThread(
//   threadId: string,
//   userId: string,
//   ) {
//   try {
//     // Find the original thread by its ID
//     const originalThread = await fetchThreadById(threadId);
//     console.log(originalThread);
//     if (!originalThread) {
//       throw new Error('Thread not found');
//     }

//     // Check if the user already liked the thread
//     const alreadyLikedIndex = originalThread.likes.findIndex(({like}:any) => like.toString() === userId);
//     console.log(alreadyLikedIndex);

//     if (alreadyLikedIndex !== -1) {
//       // If the user has already liked the thread, remove the like
//       originalThread.likes.splice(alreadyLikedIndex, 1);
//     } else {
//       // If the user hasn't liked the thread, add the like
//       // var objectId = new mongoose.Types.ObjectId('569ed8269353e9f4c51617aa');
//       console.log(userId );
//       originalThread.likes.push( userId );
//     }

//     // Save the updated thread back to the database
//     await originalThread.save();

//     // Return the updated thread or a success message if needed
//     // return originalThread;
//   } catch (err) {
//     console.error('Error while adding/removing like:', err);
//     throw new Error('Unable to add/remove like');
//   }
// }
export async function addLikeToThread(threadId: string, userId: string) {
  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);
    console.log(originalThread);
    
    if (!originalThread) {
      throw new Error('Thread not found');
    }

    const userIdObject = {userId};
    // console.log(userIdObject);
    
    // Check if the user already liked the thread
    const hasLiked = originalThread?.likes?.some((like:mongoose.Types.ObjectId) => like.equals(JSON.parse(userId)));
    // console.log(typeof(originalThread?.likes[0]));
    

    if (hasLiked) {
      // If the user has already liked the thread, remove the like
      originalThread.likes = originalThread?.likes.filter((like:mongoose.Types.ObjectId) => !like.equals(JSON.parse(userId)));
    } else {
      // If the user hasn't liked the thread, add the like
      originalThread?.likes.push(JSON.parse(userId));
    }

    // Save the updated thread back to the database
    await originalThread.save();
    // const hasLiked = originalThread?.likes.in
    const likeInfo={
      "length": originalThread.likes.length,
      "hasLiked":originalThread?.likes.includes(JSON.parse(userId))
    }
    return likeInfo;
  } catch (err) {
    console.error('Error while liking comment:', err);
    throw new Error('Unable to like comment');
  }
}

export async function checkLikedOrNot(threadId: string, userId: string){
  try {
    // Find the original thread by its ID
    
    const originalThread = await Thread.findById(threadId);
    // console.log(originalThread);
    
    if (!originalThread) {
      throw new Error('Thread not found');
    }

    const likeInfo={
      "length": originalThread.likes.length,
      "hasLiked":originalThread?.likes.includes(JSON.parse(userId))
    }
    return likeInfo;
  } catch (err) {
    console.error('Error while checking like or not:', err);
    throw new Error('Unable to check like in thread');
  }
}