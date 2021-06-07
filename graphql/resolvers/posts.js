const Post = require("../../models/Post.model");
const checkAuth = require("../../utils/check-auth");
const { AuthenticationError, UserInputError } = require("apollo-server");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (error) {
        throw new Error(error);
      }
    },

    async getPost(parent, args) {
      const { postId } = args;

      try {
        const targetPost = await Post.findById(postId);
        if (targetPost) {
          return targetPost;
        } else {
          throw new Error("Post not found");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },

  Mutation: {
    async createPost(parent, args, context, info) {
      const user = checkAuth(context);

      const { body } = args;
      if (!body) {
        throw new Error("Body must not be empty");
      }

      const newPost = new Post({
        body,
        userId: user.id,
        userName: user.userName,
        createdAt: new Date().toISOString(),
      });
      const post = await newPost.save();

      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });

      return post;
    },

    async deletePost(parent, args, context, info) {
      const user = checkAuth(context);

      const { postId } = args;

      try {
        const targetPost = await Post.findById(postId);
        if (targetPost) {
          if (user.userName === targetPost.userName) {
            await targetPost.delete();
            return "Post deleted successfully";
          } else {
            throw new AuthenticationError("Action not allowed");
          }
        } else {
          throw new Error("Post id not much");
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    async likePost(parent, args, context) {
      const user = checkAuth(context);

      const { postId } = args;

      try {
        const targetPost = await Post.findById(postId);

        if (targetPost) {
          // check if the user already liked the post
          const targetLike = targetPost.likes.find(
            (like) => like.userName === user.userName
          );

          if (!targetLike) {
            // post not liked by the user
            targetPost.likes.unshift({
              userName: user.userName,
              createdAt: new Date().toISOString(),
            });
          } else {
            // post already liked by the user
            targetPost.likes = targetPost.likes.filter(
              (like) => like.userName !== targetLike.userName
            );
          }
          await targetPost.save();

          return targetPost;
        } else {
          throw new UserInputError("Post not found!");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },

  Subscription: {
    newPost: {
      subscribe: (__, _, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
